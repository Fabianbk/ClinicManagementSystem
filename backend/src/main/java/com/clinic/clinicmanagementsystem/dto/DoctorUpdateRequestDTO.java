package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Profile-only edit. Password is changed via DoctorChangePasswordRequestDTO instead. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorUpdateRequestDTO {

    @NotBlank(message = "Username is required")
    @Size(max = 20)
    private String username;

    @NotBlank(message = "Full name is required")
    @Size(max = 255)
    private String fullname;

    @NotBlank(message = "Physician license number is required")
    @Size(max = 255)
    private String physicianLicenseNo;
}
