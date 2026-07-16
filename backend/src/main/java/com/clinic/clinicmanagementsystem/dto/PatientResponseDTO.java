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
public class PatientResponseDTO {
    private int patientId;
    private String fullname;
    private String gender;
    private String idNumber;
    private Date dateOfBirth;
    private String dateOfBirthThai;
    private String occupation;
    private String marital;
    private String nationality;
    private String ethnic;
    private String religion;
    private String bloodGroup;
    private String address;
    private String mobileNumber;
    private String email;

    private List<ContactPersonResponseDTO> contactPersons;
    private PrincipleResponseDTO principle;
    private HealthProfileResponseDTO healthProfile;

    // Note: patientAccount (has password) and appointments (large list) are
    // intentionally excluded. Fetch those via their own endpoints.
}
