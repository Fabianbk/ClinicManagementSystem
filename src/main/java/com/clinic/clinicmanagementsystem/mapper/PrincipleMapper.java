package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.PrincipleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PrincipleResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Principle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PrincipleMapper {

    Principle toEntity(PrincipleRequestDTO dto);

    PrincipleResponseDTO toResponseDTO(Principle entity);

    /** Updates an existing Principle in place — no new row created, no orphan left behind. */
    @Mapping(target = "principleId", ignore = true)
    void updateEntityFromDto(PrincipleRequestDTO dto, @MappingTarget Principle entity);
}
