package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

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

    @OneToOne(cascade = CascadeType.ALL,mappedBy = "patient")
    private PatientAccount patientAccount;

    @OneToMany(cascade=CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "patient_id")
    private List<ContactPerson> contactPersons;

    // cascade intentionally does NOT include REMOVE: Appointment rows are
    // real visit history, not owned sub-objects of Patient. Deleting a
    // Patient who has appointments will now fail on the FK constraint
    // instead of silently cascading away their whole medical history.
    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "patient")
    private List<Appointment> appointments;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    private Principle principle;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    private HealthProfile healthProfile;
}
