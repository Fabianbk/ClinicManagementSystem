package com.clinic.clinicmanagementsystem.dto;

import com.clinic.clinicmanagementsystem.enums.BloodGroupAbo;
import com.clinic.clinicmanagementsystem.enums.BloodGroupRh;
import com.clinic.clinicmanagementsystem.enums.Gender;
import com.clinic.clinicmanagementsystem.enums.HouseholdStatus;
import com.clinic.clinicmanagementsystem.enums.IdType;
import com.clinic.clinicmanagementsystem.enums.MaritalStatus;
import com.clinic.clinicmanagementsystem.enums.TreatmentRights;
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
public class PatientResponseDTO {
    private int patientId;
    private String fullname;
    private IdType idType;
    private String nationalId;
    private String passportNo;
    private String idNumber; // Unified display ID

    private Gender gender;
    private Date dateOfBirth;
    private String thaiCalendarBirthDate;
    private String occupation;
    private MaritalStatus maritalStatus;
    private String citizenship;
    private String ethnicity;
    private String religion;

    private BloodGroupAbo bloodGroupAbo;
    private BloodGroupRh bloodGroupRh;
    private String bloodGroup; // Combined string e.g. "O+" or "A-"

    private TreatmentRights treatmentRights;

    // Structured Address
    private String houseNo;
    private String moo;
    private String soi;
    private String road;
    private String subDistrict;
    private String district;
    private String province;
    private String zipCode;
    private String address; // Full address string

    // Thai-Specific Master Data
    private String birthPlace;
    private String originalDomicile;
    private String fatherName;
    private String motherName;
    private String spouseName;
    private HouseholdStatus householdStatus;
    private String education;

    // Contact
    private String mobileNumber;
    private String email;

    private List<ContactPersonResponseDTO> contactPersons;
    private PrincipleResponseDTO principle;
}
