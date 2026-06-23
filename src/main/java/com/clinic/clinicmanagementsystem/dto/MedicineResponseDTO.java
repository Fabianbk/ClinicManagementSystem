package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineResponseDTO {
    private int medicineId;
    private String medicineName;
    private String medicineCategory;
    private Double unitPrice;
    private String unitType;
    private Integer stockRemaining;
    private Integer stockBroughtForward;
    private Integer stockReceived;
    private Integer stockIssued;
    private String note;
}
