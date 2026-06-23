package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.HealthProfileRequestDTO;
import com.clinic.clinicmanagementsystem.dto.HealthProfileResponseDTO;
import com.clinic.clinicmanagementsystem.entity.HealthProfile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface HealthProfileMapper {

    HealthProfile toEntity(HealthProfileRequestDTO dto);

    HealthProfileResponseDTO toResponseDTO(HealthProfile entity);
}
