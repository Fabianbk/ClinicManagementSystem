package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.DoctorRequestDTO;
import com.clinic.clinicmanagementsystem.dto.DoctorResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DoctorMapper {

    @Mapping(target = "doctorId", ignore = true)
    @Mapping(target = "workingSchedules", ignore = true)
    @Mapping(target = "recordTreatments", ignore = true)
    // Note: dto.password is plain text here — hash it in the service BEFORE calling toEntity,
    // or re-set entity.setPassword(hashed) right after mapping.
    Doctor toEntity(DoctorRequestDTO dto);

    DoctorResponseDTO toResponseDTO(Doctor entity);
}
