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

    @Size(max = 65535)
    private String presentHistory;

    @Size(max = 65535)
    private String underlyingDisease;

    @Size(max = 65535)
    private String hereditaryDisease;

    @Size(max = 65535)
    private String drugAllergy;

    @Size(max = 65535)
    private String foodAllergy;

    @Size(max = 65535)
    private String accidentHistory;

    @Size(max = 65535)
    private String personalHistory;

    @Size(max = 65535)
    private String alcoholConsumption;

    @Size(max = 65535)
    private String smokingHistory;

    @Size(max = 65535)
    private String menstruation;
}
