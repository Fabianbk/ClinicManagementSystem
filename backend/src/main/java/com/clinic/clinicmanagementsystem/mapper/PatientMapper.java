package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.PatientRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.enums.BloodGroupAbo;
import com.clinic.clinicmanagementsystem.enums.BloodGroupRh;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

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

    @Mapping(target = "idNumber", expression = "java(entity.getIdNumber())")
    @Mapping(target = "address", expression = "java(entity.getFullAddress())")
    @Mapping(target = "bloodGroup", expression = "java(formatBloodGroup(entity.getBloodGroupAbo(), entity.getBloodGroupRh()))")
    PatientResponseDTO toResponseDTO(Patient entity);

    /**
     * Updates only Patient's own scalar fields on an already-loaded entity.
     * Deliberately leaves contactPersons / principle / healthProfile alone —
     * those have dedicated update paths in PatientService so we never
     * silently orphan a row (see PatientService for why).
     */
    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "patientAccount", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "contactPersons", ignore = true)
    @Mapping(target = "principle", ignore = true)
    @Mapping(target = "healthProfile", ignore = true)
    void updateBasicInfo(PatientRequestDTO dto, @MappingTarget Patient entity);

    default String formatBloodGroup(BloodGroupAbo abo, BloodGroupRh rh) {
        if (abo == null || abo == BloodGroupAbo.UNKNOWN) return "UNKNOWN";
        if (rh == null || rh == BloodGroupRh.UNKNOWN) return abo.name();
        return abo.name() + (rh == BloodGroupRh.POSITIVE ? "+" : "-");
    }
}
