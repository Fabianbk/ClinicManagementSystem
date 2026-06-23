package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.PrincipleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PrincipleResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Principle;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PrincipleMapper {

    Principle toEntity(PrincipleRequestDTO dto);

    PrincipleResponseDTO toResponseDTO(Principle entity);
}
