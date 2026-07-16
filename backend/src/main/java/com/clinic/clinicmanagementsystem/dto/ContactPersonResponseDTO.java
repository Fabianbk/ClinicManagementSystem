package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactPersonResponseDTO {
    private int contactId;
    private String contactName;
    private String relationship;
    private String contactAddress;
    private String mobileNumber;
}
