package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptRequestDTO {

    @NotNull(message = "Record treatment ID is required")
    private Integer recordTreatmentId;

    @NotNull(message = "Receipt date is required")
    private Date receiptDate;

    @NotBlank(message = "Payment status is required")
    @Size(max = 50)
    private String paymentStatus;

    @Size(max = 50)
    private String paymentMethod;

    private List<ReceiptItemDTO> additionalItems;

    @Size(max = 255)
    private String note;
}