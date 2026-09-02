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
public class ReceiptItemDTO {

    @NotBlank(message = "Item name is required")
    @Size(max = 255)
    private String itemName;

    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount must be zero or positive")
    private Double amount;
}
