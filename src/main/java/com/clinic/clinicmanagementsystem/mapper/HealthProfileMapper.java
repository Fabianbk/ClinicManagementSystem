package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.HealthProfileRequestDTO;
import com.clinic.clinicmanagementsystem.dto.HealthProfileResponseDTO;
import com.clinic.clinicmanagementsystem.entity.HealthProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface HealthProfileMapper {

    HealthProfile toEntity(HealthProfileRequestDTO dto);

    HealthProfileResponseDTO toResponseDTO(HealthProfile entity);

    /** Updates an existing HealthProfile in place — no new row created, no orphan left behind. */
    @Mapping(target = "healthId", ignore = true)
    void updateEntityFromDto(HealthProfileRequestDTO dto, @MappingTarget HealthProfile entity);
}
