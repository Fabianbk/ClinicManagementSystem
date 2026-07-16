package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.MedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Medicine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MedicineMapper {

    @Mapping(target = "medicineId", ignore = true)
    @Mapping(target = "recordTreatmentMedicines", ignore = true)
    Medicine toEntity(MedicineRequestDTO dto);

    MedicineResponseDTO toResponseDTO(Medicine entity);
}
