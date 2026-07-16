package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthProfileRequestDTO {

    @Size(max = 1000)
    private String presentHistory;

    @Size(max = 1000)
    private String underlyingDisease;

    @Size(max = 1000)
    private String hereditaryDisease;

    @Size(max = 1000)
    private String drugAllergy;

    @Size(max = 1000)
    private String foodAllergy;

    @Size(max = 1000)
    private String accidentHistory;

    @Size(max = 1000)
    private String personalHistory;

    @Size(max = 255)
    private String alcoholConsumption;

    @Size(max = 255)
    private String smokingHistory;

    @Size(max = 255)
    private String menstruation;
}
