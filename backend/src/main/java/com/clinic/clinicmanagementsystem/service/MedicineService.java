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
        if (medicine.getIsActive() == null) {
            medicine.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        }
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
    public Page<MedicineResponseDTO> getAll(Boolean activeOnly, Pageable pageable) {
        Page<Medicine> page = Boolean.TRUE.equals(activeOnly)
                ? medicineRepository.findByIsActiveTrue(pageable)
                : medicineRepository.findAll(pageable);
        return page.map(m -> enrichMedicine(medicineMapper.toResponseDTO(m), m.getMedicineId()));
    }

    @Transactional(readOnly = true)
    public Page<MedicineResponseDTO> getAll(Pageable pageable) {
        return getAll(false, pageable);
    }

    /**
     * Updates editable master fields (name, category, price, unit, note, isActive).
     */
    public MedicineResponseDTO update(int medicineId, MedicineRequestDTO dto) {
        Medicine existing = findMedicineOrThrow(medicineId);

        boolean nameChanged = !existing.getMedicineName().equalsIgnoreCase(dto.getMedicineName());
        if (nameChanged && medicineRepository.existsByMedicineNameIgnoreCase(dto.getMedicineName())) {
            throw new DuplicateResourceException(
                    "A medicine named '" + dto.getMedicineName() + "' already exists");
        }

        // Preserve stock counts and active status from existing if not explicitly provided
        Integer existingRemaining = existing.getStockRemaining();
        Integer existingReceived = existing.getStockReceived();
        Integer existingIssued = existing.getStockIssued();
        Integer existingBrought = existing.getStockBroughtForward();
        Boolean existingIsActive = existing.getIsActive();

        medicineMapper.updateEntityFromDto(dto, existing);

        if (dto.getStockRemaining() == null) existing.setStockRemaining(existingRemaining);
        if (dto.getStockReceived() == null) existing.setStockReceived(existingReceived);
        if (dto.getStockIssued() == null) existing.setStockIssued(existingIssued);
        if (dto.getStockBroughtForward() == null) existing.setStockBroughtForward(existingBrought);
        if (dto.getIsActive() == null) existing.setIsActive(existingIsActive != null ? existingIsActive : true);

        Medicine saved = medicineRepository.save(existing);
        return enrichMedicine(medicineMapper.toResponseDTO(saved), saved.getMedicineId());
    }

    /**
     * Soft-delete: Marks the medicine as inactive instead of deleting the row,
     * preserving historical ledger entries, lot tracking, and past prescriptions.
     */
    public void delete(int medicineId) {
        Medicine medicine = findMedicineOrThrow(medicineId);
        medicine.setIsActive(false);
        medicineRepository.save(medicine);
    }

    /**
     * Reactivates or deactivates a medicine catalog entry.
     */
    public MedicineResponseDTO toggleStatus(int medicineId) {
        Medicine medicine = findMedicineOrThrow(medicineId);
        boolean nextState = medicine.getIsActive() == null || !medicine.getIsActive();
        medicine.setIsActive(nextState);
        Medicine saved = medicineRepository.save(medicine);
        return enrichMedicine(medicineMapper.toResponseDTO(saved), saved.getMedicineId());
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