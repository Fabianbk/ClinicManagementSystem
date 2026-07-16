package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAccountRequestDTO {

    @NotNull(message = "Patient ID is required")
    private Integer patientId;

    @NotBlank(message = "Username is required")
    private String username;

    /** Plain text in the request only — the service layer must hash this before saving. */
    @NotBlank(message = "Password is required")
    private String password;
}
