package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptResponseDTO {
    private int receiptId;
    private Date receiptDate;
    private String paymentStatus;
    private String paymentMethod;
    private Double totalPrice;

    private int recordTreatmentId;
}
