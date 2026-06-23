package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorRequestDTO {

    @NotBlank(message = "Username is required")
    @Size(max = 20)
    private String username;

    /** Plain text in the request only — the service layer must hash this before saving. */
    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(max = 255)
    private String fullname;

    @NotBlank(message = "Physician license number is required")
    @Size(max = 255)
    private String physicianLicenseNo;
}
