package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.PatientAccountRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientAccountResponseDTO;
import com.clinic.clinicmanagementsystem.entity.PatientAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PatientAccountMapper {

    @Mapping(target = "patient", ignore = true) // service looks up Patient by dto.patientId and sets it
    // Note: dto.password is plain text here — hash it in the service.
    PatientAccount toEntity(PatientAccountRequestDTO dto);

    @Mapping(target = "patientId", source = "patient.patientId")
    PatientAccountResponseDTO toResponseDTO(PatientAccount entity);
}
