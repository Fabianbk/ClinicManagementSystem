package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.PrincipleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PrincipleResponseDTO;
import com.clinic.clinicmanagementsystem.entity.DhatuPrinciple;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PrincipleMapper {

    @Mapping(target = "principleId", ignore = true)
    DhatuPrinciple toEntity(PrincipleRequestDTO dto);

    PrincipleResponseDTO toResponseDTO(DhatuPrinciple entity);

    /** Updates an existing DhatuPrinciple in place — no new row created, no orphan left behind. */
    @Mapping(target = "principleId", ignore = true)
    void updateEntityFromDto(PrincipleRequestDTO dto, @MappingTarget DhatuPrinciple entity);
}
