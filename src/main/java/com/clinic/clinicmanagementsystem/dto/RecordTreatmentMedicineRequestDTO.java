package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordTreatmentMedicineRequestDTO {

    @NotNull(message = "Record treatment ID is required")
    private Integer recordTreatmentId;

    @NotNull(message = "Medicine ID is required")
    private Integer medicineId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    // priceAtTime and subTotal are NOT accepted from the client.
    // The service layer must look up Medicine.unitPrice and compute these,
    // otherwise a client could submit a tampered total.
}
