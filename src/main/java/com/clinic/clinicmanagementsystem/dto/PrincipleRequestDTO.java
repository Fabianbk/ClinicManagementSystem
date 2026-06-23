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
public class PrincipleRequestDTO {

    @Size(max = 255)
    private String principleDhatu;

    @Size(max = 255)
    private String secondaryDhatu;

    @Size(max = 255)
    private String elementaryPrinciples;

    @Size(max = 255)
    private String seasonalPrinciples;

    @Size(max = 255)
    private String agePrinciples;

    @Size(max = 255)
    private String timePrinciples;

    @Size(max = 255)
    private String geographicPrinciples;
}
