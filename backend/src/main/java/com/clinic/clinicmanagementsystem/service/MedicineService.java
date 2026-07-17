package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.MedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Medicine;
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.MedicineMapper;
import com.clinic.clinicmanagementsystem.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineMapper medicineMapper;

    public MedicineResponseDTO create(MedicineRequestDTO dto) {
        if (medicineRepository.existsByMedicineNameIgnoreCase(dto.getMedicineName())) {
            throw new DuplicateResourceException(
                    "A medicine named '" + dto.getMedicineName() + "' already exists");
        }

        Medicine medicine = medicineMapper.toEntity(dto);
        return medicineMapper.toResponseDTO(medicineRepository.save(medicine));
    }

    @Transactional(readOnly = true)
    public MedicineResponseDTO getById(int medicineId) {
        return medicineMapper.toResponseDTO(findMedicineOrThrow(medicineId));
    }

    @Transactional(readOnly = true)
    public Page<MedicineResponseDTO> getAll(Pageable pageable) {
        return medicineRepository.findAll(pageable).map(medicineMapper::toResponseDTO);
    }

    /**
     * Updates all editable fields, including stock counts (stockRemaining,
     * stockBroughtForward, stockReceived, stockIssued) — per SRS 3.1.32 the
     * Edit Medicine form covers the same fields as Add Medicine. Name
     * uniqueness is re-checked only if the name actually changed.
     */
    public MedicineResponseDTO update(int medicineId, MedicineRequestDTO dto) {
        Medicine existing = findMedicineOrThrow(medicineId);

        boolean nameChanged = !existing.getMedicineName().equalsIgnoreCase(dto.getMedicineName());
        if (nameChanged && medicineRepository.existsByMedicineNameIgnoreCase(dto.getMedicineName())) {
            throw new DuplicateResourceException(
                    "A medicine named '" + dto.getMedicineName() + "' already exists");
        }

        medicineMapper.updateEntityFromDto(dto, existing);
        return medicineMapper.toResponseDTO(medicineRepository.save(existing));
    }

    private Medicine findMedicineOrThrow(int medicineId) {
        return medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", medicineId));
    }
}