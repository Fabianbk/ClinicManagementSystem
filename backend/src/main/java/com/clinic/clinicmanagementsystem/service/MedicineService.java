package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.MedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Medicine;
import com.clinic.clinicmanagementsystem.entity.MedicineLot;
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.MedicineLotMapper;
import com.clinic.clinicmanagementsystem.mapper.MedicineMapper;
import com.clinic.clinicmanagementsystem.repository.MedicineLotRepository;
import com.clinic.clinicmanagementsystem.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineLotRepository medicineLotRepository;
    private final MedicineMapper medicineMapper;
    private final MedicineLotMapper medicineLotMapper;

    public MedicineResponseDTO create(MedicineRequestDTO dto) {
        if (medicineRepository.existsByMedicineNameIgnoreCase(dto.getMedicineName())) {
            throw new DuplicateResourceException(
                    "A medicine named '" + dto.getMedicineName() + "' already exists");
        }

        Medicine medicine = medicineMapper.toEntity(dto);
        if (medicine.getStockRemaining() == null) medicine.setStockRemaining(0);
        if (medicine.getStockReceived() == null) medicine.setStockReceived(0);
        if (medicine.getStockIssued() == null) medicine.setStockIssued(0);
        if (medicine.getStockBroughtForward() == null) medicine.setStockBroughtForward(0);

        Medicine saved = medicineRepository.save(medicine);
        return enrichMedicine(medicineMapper.toResponseDTO(saved), saved.getMedicineId());
    }

    @Transactional(readOnly = true)
    public MedicineResponseDTO getById(int medicineId) {
        Medicine medicine = findMedicineOrThrow(medicineId);
        return enrichMedicine(medicineMapper.toResponseDTO(medicine), medicineId);
    }

    @Transactional(readOnly = true)
    public Page<MedicineResponseDTO> getAll(Pageable pageable) {
        return medicineRepository.findAll(pageable)
                .map(m -> enrichMedicine(medicineMapper.toResponseDTO(m), m.getMedicineId()));
    }

    /**
     * Updates editable master fields (name, category, price, unit, note).
     */
    public MedicineResponseDTO update(int medicineId, MedicineRequestDTO dto) {
        Medicine existing = findMedicineOrThrow(medicineId);

        boolean nameChanged = !existing.getMedicineName().equalsIgnoreCase(dto.getMedicineName());
        if (nameChanged && medicineRepository.existsByMedicineNameIgnoreCase(dto.getMedicineName())) {
            throw new DuplicateResourceException(
                    "A medicine named '" + dto.getMedicineName() + "' already exists");
        }

        // Preserve stock counts from existing if not explicitly provided
        Integer existingRemaining = existing.getStockRemaining();
        Integer existingReceived = existing.getStockReceived();
        Integer existingIssued = existing.getStockIssued();
        Integer existingBrought = existing.getStockBroughtForward();

        medicineMapper.updateEntityFromDto(dto, existing);

        if (dto.getStockRemaining() == null) existing.setStockRemaining(existingRemaining);
        if (dto.getStockReceived() == null) existing.setStockReceived(existingReceived);
        if (dto.getStockIssued() == null) existing.setStockIssued(existingIssued);
        if (dto.getStockBroughtForward() == null) existing.setStockBroughtForward(existingBrought);

        Medicine saved = medicineRepository.save(existing);
        return enrichMedicine(medicineMapper.toResponseDTO(saved), saved.getMedicineId());
    }

    public void delete(int medicineId) {
        Medicine medicine = findMedicineOrThrow(medicineId);
        medicineRepository.delete(medicine);
    }

    private Medicine findMedicineOrThrow(int medicineId) {
        return medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", medicineId));
    }

    private MedicineResponseDTO enrichMedicine(MedicineResponseDTO dto, int medicineId) {
        List<MedicineLot> lots = medicineLotRepository.findByMedicine_MedicineIdOrderByExpiryDateAsc(medicineId);
        LocalDate today = LocalDate.now();
        LocalDate soonThreshold = today.plusDays(60);

        List<MedicineLot> activeLots = lots.stream()
                .filter(l -> l.getQuantityRemaining() != null && l.getQuantityRemaining() > 0)
                .collect(Collectors.toList());

        dto.setActiveLotCount(activeLots.size());

        LocalDate earliest = null;
        boolean hasExpiringSoon = false;
        boolean hasExpired = false;

        for (MedicineLot l : activeLots) {
            if (earliest == null || l.getExpiryDate().isBefore(earliest)) {
                earliest = l.getExpiryDate();
            }
            if (l.getExpiryDate().isBefore(today)) {
                hasExpired = true;
            } else if (l.getExpiryDate().isBefore(soonThreshold)) {
                hasExpiringSoon = true;
            }
        }

        dto.setEarliestExpiryDate(earliest);
        dto.setHasExpiringSoon(hasExpiringSoon);
        dto.setHasExpired(hasExpired);
        dto.setLots(lots.stream().map(medicineLotMapper::toResponseDTO).collect(Collectors.toList()));

        return dto;
    }
}