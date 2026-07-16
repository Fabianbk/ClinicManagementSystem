package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "contact_persons")
public class ContactPerson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int contactId;

    @Column(name = "contact_name", nullable = false, length = 255)
    private String contactName;

    @Column(name = "relationship", length = 100)
    private String relationship;

    @Column(name = "contact_address", length = 255)
    private String contactAddress;

    @Column(name = "mobile_number", length = 20)
    private String mobileNumber;
}
