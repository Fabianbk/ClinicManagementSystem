package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

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

    private Integer activeLotCount;
    private LocalDate earliestExpiryDate;
    private Boolean hasExpiringSoon;
    private Boolean hasExpired;
    private List<MedicineLotResponseDTO> lots;
}
