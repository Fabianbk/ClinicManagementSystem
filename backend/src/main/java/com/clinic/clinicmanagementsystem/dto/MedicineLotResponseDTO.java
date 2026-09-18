package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineLotResponseDTO {
    private int lotId;
    private int medicineId;
    private String medicineName;
    private String unitType;
    private String lotNumber;
    private LocalDate manufactureDate;
    private LocalDate expiryDate;
    private LocalDate receivedDate;
    private Integer quantityReceived;
    private Integer quantityRemaining;
    private Double costPrice;
    private String status; // "ACTIVE", "DEPLETED", "EXPIRED"
    private String note;
    private long daysUntilExpiry;
    private boolean expired;
    private boolean expiringSoon;
}
