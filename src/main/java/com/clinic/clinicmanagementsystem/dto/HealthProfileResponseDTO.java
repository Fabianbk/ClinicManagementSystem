package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthProfileResponseDTO {
    private int healthId;
    private String presentHistory;
    private String underlyingDisease;
    private String hereditaryDisease;
    private String drugAllergy;
    private String foodAllergy;
    private String accidentHistory;
    private String personalHistory;
    private String alcoholConsumption;
    private String smokingHistory;
    private String menstruation;
}
