package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrincipleResponseDTO {
    private int principleId;
    private String principleDhatu;
    private String secondaryDhatu;
    private String elementaryPrinciples;
    private String seasonalPrinciples;
    private String agePrinciples;
    private String timePrinciples;
    private String geographicPrinciples;
}
