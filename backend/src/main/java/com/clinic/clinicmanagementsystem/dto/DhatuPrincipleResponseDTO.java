package com.clinic.clinicmanagementsystem.dto;

import com.clinic.clinicmanagementsystem.enums.AgePrinciple;
import com.clinic.clinicmanagementsystem.enums.Dhatu;
import com.clinic.clinicmanagementsystem.enums.TriDosha;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DhatuPrincipleResponseDTO {
    private int principleId;

    private Dhatu principalDhatu;
    private Dhatu secondaryDhatu;

    private Dhatu conceptionDhatu;
    private TriDosha conceptionCharacteristic;

    private TriDosha seasonalOnset;
    private TriDosha seasonalCurrent;

    private TriDosha timeOnset;
    private TriDosha timeCurrent;

    private Dhatu geoBirthplace;
    private Dhatu geoCurrent;

    private AgePrinciple agePrinciple;
}
