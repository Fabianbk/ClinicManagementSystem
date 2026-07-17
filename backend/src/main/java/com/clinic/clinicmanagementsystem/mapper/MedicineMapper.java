package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.MedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Medicine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MedicineMapper {

    @Mapping(target = "medicineId", ignore = true)
    @Mapping(target = "recordTreatmentMedicines", ignore = true)
    Medicine toEntity(MedicineRequestDTO dto);

    MedicineResponseDTO toResponseDTO(Medicine entity);

    /** Updates an existing Medicine in place — no new row created, stock history stays attached. */
    @Mapping(target = "medicineId", ignore = true)
    @Mapping(target = "recordTreatmentMedicines", ignore = true)
    void updateEntityFromDto(MedicineRequestDTO dto, @MappingTarget Medicine entity);
}