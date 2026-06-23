package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Integer patientId;

    @NotNull(message = "Slot ID is required")
    private Integer slotId;

    @NotBlank(message = "Status is required")
    @Size(max = 50)
    private String status;
}
