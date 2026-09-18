package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineLotRequestDTO {

    @NotNull(message = "Medicine ID is required")
    private Integer medicineId;

    @NotBlank(message = "Lot number is required")
    @Size(max = 50)
    private String lotNumber;

    private LocalDate manufactureDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    private LocalDate receivedDate;

    @NotNull(message = "Quantity received is required")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantityReceived;

    @PositiveOrZero
    private Double costPrice;

    @Size(max = 255)
    private String note;
}
