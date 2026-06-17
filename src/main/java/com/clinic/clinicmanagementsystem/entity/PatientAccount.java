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
@Table(name = "patient_accounts")
public class PatientAccount {

    @Id
    @Column(unique = true, nullable = false)
    private String username;
    @Column(length = 255, nullable = false)
    private String password;
    @OneToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}
