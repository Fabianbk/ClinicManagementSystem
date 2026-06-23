package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
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
public class PatientRequestDTO {

    @NotBlank(message = "Full name is required")
    @Size(max = 255)
    private String fullname;

    @NotBlank(message = "Gender is required")
    @Size(max = 10)
    private String gender;

    @NotBlank(message = "ID number is required")
    @Size(min = 13, max = 13, message = "ID number must be 13 digits")
    private String idNumber;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private Date dateOfBirth;

    @NotBlank
    private String dateOfBirthThai;

    @NotBlank
    @Size(max = 255)
    private String occupation;

    @NotBlank
    @Size(max = 50)
    private String marital;

    @NotBlank
    @Size(max = 100)
    private String nationality;

    @NotBlank
    @Size(max = 100)
    private String ethnic;

    @NotBlank
    @Size(max = 100)
    private String religion;

    @NotBlank
    @Size(max = 5)
    private String bloodGroup;

    @NotBlank
    @Size(max = 255)
    private String address;

    @NotBlank
    @Size(max = 20)
    private String mobileNumber;

    @Email(message = "Email must be a valid email address")
    @Size(max = 100)
    private String email;

    /** Optional: submit emergency contacts as part of patient intake */
    @Valid
    private List<ContactPersonRequestDTO> contactPersons;

    /** Optional: submit TTM principle assessment as part of patient intake */
    @Valid
    private PrincipleRequestDTO principle;

    /** Optional: submit health profile as part of patient intake */
    @Valid
    private HealthProfileRequestDTO healthProfile;
}
