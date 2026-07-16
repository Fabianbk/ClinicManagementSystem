package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordTreatmentMedicineResponseDTO {
    private int recordTreatmentMedicineId;
    private Integer quantity;
    private Double priceAtTime;
    private Double subTotal;

    private int medicineId;
    private String medicineName;
}
