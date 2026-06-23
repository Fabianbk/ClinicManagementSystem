package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.PatientRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * contactPersons / principle / healthProfile are mapped automatically via the
 * 'uses' mappers below since the field names match on both sides.
 */
@Mapper(
        componentModel = "spring",
        uses = {ContactPersonMapper.class, PrincipleMapper.class, HealthProfileMapper.class}
)
public interface PatientMapper {

    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "patientAccount", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    Patient toEntity(PatientRequestDTO dto);

    PatientResponseDTO toResponseDTO(Patient entity);
}
