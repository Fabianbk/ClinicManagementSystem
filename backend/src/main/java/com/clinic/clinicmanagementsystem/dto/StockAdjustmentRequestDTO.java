package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustmentRequestDTO {

    @NotNull(message = "Medicine ID is required")
    private Integer medicineId;

    private Integer lotId;

    @NotNull(message = "New quantity remaining is required")
    @PositiveOrZero(message = "Quantity must be zero or positive")
    private Integer newQuantityRemaining;

    @NotBlank(message = "Adjustment reason is required")
    private String reason;

    private String note;
}
