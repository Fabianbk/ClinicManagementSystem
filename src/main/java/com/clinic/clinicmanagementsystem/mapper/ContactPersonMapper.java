package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.ContactPersonRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ContactPersonResponseDTO;
import com.clinic.clinicmanagementsystem.entity.ContactPerson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ContactPersonMapper {

    ContactPerson toEntity(ContactPersonRequestDTO dto);

    ContactPersonResponseDTO toResponseDTO(ContactPerson entity);

    /** Updates an existing ContactPerson in place (e.g. editing a phone number). */
    @Mapping(target = "contactId", ignore = true)
    void updateEntityFromDto(ContactPersonRequestDTO dto, @MappingTarget ContactPerson entity);
}
