package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.ContactPersonRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ContactPersonResponseDTO;
import com.clinic.clinicmanagementsystem.entity.ContactPerson;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ContactPersonMapper {

    ContactPerson toEntity(ContactPersonRequestDTO dto);

    ContactPersonResponseDTO toResponseDTO(ContactPerson entity);
}
