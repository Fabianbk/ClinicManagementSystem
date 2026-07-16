package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.DoctorRequestDTO;
import com.clinic.clinicmanagementsystem.dto.DoctorResponseDTO;
import com.clinic.clinicmanagementsystem.dto.DoctorUpdateRequestDTO;
import com.clinic.clinicmanagementsystem.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DoctorMapper {

    @Mapping(target = "doctorId", ignore = true)
    @Mapping(target = "workingSchedules", ignore = true)
    @Mapping(target = "recordTreatments", ignore = true)
    // dto.password is plain text here — the service hashes it right after calling this.
    Doctor toEntity(DoctorRequestDTO dto);

    DoctorResponseDTO toResponseDTO(Doctor entity);

    /** Profile-only update — password is intentionally untouched. See DoctorService#changePassword. */
    @Mapping(target = "doctorId", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "workingSchedules", ignore = true)
    @Mapping(target = "recordTreatments", ignore = true)
    void updateProfile(DoctorUpdateRequestDTO dto, @MappingTarget Doctor entity);
}
