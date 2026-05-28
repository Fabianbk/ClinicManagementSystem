package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int patientId;

    @Column(name = "fullname", nullable = false, length = 255)
    private String fullname;

    @Column(name = "gender" , nullable = false, length = 10)
    private String gender;

    @Column(name = "id_number" , nullable = false, unique = true,length = 13)
    private String idNumber;

    @Column(name = "date_of_birth" , nullable = false)
    private Date dateOfBirth;

    @Column(name = "date_of_birth_thai" , nullable = false)
    private String dateOfBirthThai;

    @Column(name = "occupation" , nullable = false, length = 255)
    private String occupation;

    @Column(name = "marital" , nullable = false, length = 50)
    private String marital;

    @Column(name = "nationality" , nullable = false, length = 100)
    private String nationality;

    @Column(name = "ethnic" , nullable = false, length = 100)
    private String ethnic;

    @Column(name = "religion" , nullable = false, length = 100)
    private String religion;

    @Column(name = "bloodGroup" , nullable = false, length = 5)
    private String bloodGroup;

    @Column(name = "address" , nullable = false, length = 255)
    private String address;

    @Column(name = "mobile_number" , nullable = false, length = 20)
    private String mobileNumber;

    @Column(name = "email", length = 100)
    private String email;
}
