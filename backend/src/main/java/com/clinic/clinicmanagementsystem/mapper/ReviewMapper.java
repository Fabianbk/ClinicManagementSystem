package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.ReviewRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ReviewResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "reviewId", ignore = true)
    @Mapping(target = "patient", ignore = true)
    Review toEntity(ReviewRequestDTO dto);

    @Mapping(target = "patientId", source = "patient.patientId")
    @Mapping(target = "patientFullname", source = "patient.fullname")
    ReviewResponseDTO toResponseDTO(Review entity);
}
