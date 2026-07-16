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
public class ContactPersonRequestDTO {

    @NotBlank(message = "Contact name is required")
    @Size(max = 255)
    private String contactName;

    @Size(max = 100)
    private String relationship;

    @Size(max = 255)
    private String contactAddress;

    @Size(max = 20)
    private String mobileNumber;
}
