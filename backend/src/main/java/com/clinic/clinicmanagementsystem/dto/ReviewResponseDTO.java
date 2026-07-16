package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDTO {
    private int reviewId;
    private Integer ratingClinicScore;
    private String comment;
    private Date reviewDate;

    private int patientId;
    private String patientFullname;
}
