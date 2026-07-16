package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Integer patientId;

    @NotNull(message = "Rating is required")
    @Min(1)
    @Max(5)
    private Integer ratingClinicScore;

    @Size(max = 1000)
    private String comment;

    @NotNull(message = "Review date is required")
    private Date reviewDate;
}
