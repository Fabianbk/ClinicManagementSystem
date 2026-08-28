package com.clinic.clinicmanagementsystem.dto;

import com.clinic.clinicmanagementsystem.enums.BloodGroupAbo;
import com.clinic.clinicmanagementsystem.enums.BloodGroupRh;
import com.clinic.clinicmanagementsystem.enums.Gender;
import com.clinic.clinicmanagementsystem.enums.HouseholdStatus;
import com.clinic.clinicmanagementsystem.enums.IdType;
import com.clinic.clinicmanagementsystem.enums.MaritalStatus;
import com.clinic.clinicmanagementsystem.enums.TreatmentRights;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
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

    @NotNull(message = "ID type is required")
    private IdType idType;

    @Size(max = 13)
    private String nationalId;

    @Size(max = 15)
    private String passportNo;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private Date dateOfBirth;

    @Size(max = 100)
    private String dateOfBirthThai;

    @Size(max = 100)
    private String thaiCalendarBirthDate;

    @Size(max = 255)
    private String occupation;

    private MaritalStatus maritalStatus;

    @Size(max = 100)
    private String citizenship;

    @Size(max = 100)
    private String ethnicity;

    @Size(max = 100)
    private String religion;

    private BloodGroupAbo bloodGroupAbo;

    private BloodGroupRh bloodGroupRh;

    private TreatmentRights treatmentRights;

    // Structured Address
    @Size(max = 50)
    private String houseNo;

    @Size(max = 50)
    private String moo;

    @Size(max = 100)
    private String soi;

    @Size(max = 100)
    private String road;

    @Size(max = 100)
    private String subDistrict;

    @Size(max = 100)
    private String district;

    @Size(max = 100)
    private String province;

    @Size(max = 20)
    private String zipCode;

    // Thai-Specific Master Data (Nullable)
    @Size(max = 255)
    private String birthPlace;

    @Size(max = 255)
    private String originalDomicile;

    @Size(max = 255)
    private String fatherName;

    @Size(max = 255)
    private String motherName;

    @Size(max = 255)
    private String spouseName;

    private HouseholdStatus householdStatus;

    @Size(max = 100)
    private String education;

    // Contact
    @NotBlank(message = "Mobile number is required")
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

    @AssertTrue(message = "ID number configuration is invalid: exactly one of nationalId (13 digits) or passportNo (up to 15 characters) must match idType")
    public boolean isValidId() {
        if (idType == null) return false;
        if (idType == IdType.THAI_ID) {
            return nationalId != null && nationalId.trim().length() == 13 && (passportNo == null || passportNo.trim().isEmpty());
        } else if (idType == IdType.PASSPORT) {
            return passportNo != null && !passportNo.trim().isEmpty() && passportNo.trim().length() <= 15 && (nationalId == null || nationalId.trim().isEmpty());
        }
        return false;
    }
}
