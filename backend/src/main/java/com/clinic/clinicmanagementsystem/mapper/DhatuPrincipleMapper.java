package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.DhatuPrincipleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.DhatuPrincipleResponseDTO;
import com.clinic.clinicmanagementsystem.entity.DhatuPrinciple;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DhatuPrincipleMapper {

    @Mapping(target = "principleId", ignore = true)
    DhatuPrinciple toEntity(DhatuPrincipleRequestDTO dto);

    DhatuPrincipleResponseDTO toResponseDTO(DhatuPrinciple entity);

    @Mapping(target = "principleId", ignore = true)
    void updateEntityFromDto(DhatuPrincipleRequestDTO dto, @MappingTarget DhatuPrinciple entity);
}
