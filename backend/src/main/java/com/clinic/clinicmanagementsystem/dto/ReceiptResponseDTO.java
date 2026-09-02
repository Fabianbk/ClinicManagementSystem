package com.clinic.clinicmanagementsystem.dto;

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
public class ReceiptResponseDTO {
    private int receiptId;
    private Date receiptDate;
    private String paymentStatus;
    private String paymentMethod;
    private Double medicineTotal;
    private List<ReceiptItemDTO> additionalItems;
    private Double totalPrice;
    private String note;

    private int recordTreatmentId;
    private List<RecordTreatmentMedicineResponseDTO> medicines;
}
