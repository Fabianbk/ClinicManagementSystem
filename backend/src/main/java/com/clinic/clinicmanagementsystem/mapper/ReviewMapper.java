package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.ReviewRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ReviewResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "reviewId", ignore = true)
    @Mapping(target = "patient", ignore = true)
    Review toEntity(ReviewRequestDTO dto);

    @Mapping(target = "patientId", source = "patient.patientId")
    @Mapping(target = "patientFullname", source = "patient.fullname")
    ReviewResponseDTO toResponseDTO(Review entity);

    /** Edit Review Clinic — rating/comment/date only; patient reference never changes. */
    @Mapping(target = "reviewId", ignore = true)
    @Mapping(target = "patient", ignore = true)
    void updateEntityFromDto(ReviewRequestDTO dto, @MappingTarget Review entity);
}