package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineRequestDTO {

    @NotBlank(message = "Medicine name is required")
    @Size(max = 255)
    private String medicineName;

    @Size(max = 100)
    private String medicineCategory;

    @NotNull(message = "Unit price is required")
    @PositiveOrZero
    private Double unitPrice;

    @Size(max = 50)
    private String unitType;

    @PositiveOrZero
    private Integer stockRemaining;

    @PositiveOrZero
    private Integer stockBroughtForward;

    @PositiveOrZero
    private Integer stockReceived;

    @PositiveOrZero
    private Integer stockIssued;

    @Size(max = 255)
    private String note;
}
