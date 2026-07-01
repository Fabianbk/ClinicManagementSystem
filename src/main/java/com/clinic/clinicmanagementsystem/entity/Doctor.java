package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int doctorId;

    @Column(name = "username", nullable = false, unique = true, length = 20)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "fullname", nullable = false, length = 255)
    private String fullname;

    @Column(name = "physician_license_no", nullable = false, length = 255)
    private String physicianLicenseNo;

    // cascade intentionally does NOT include REMOVE: WorkingSchedule rows are
    // real historical records (a doctor's past availability), not owned
    // sub-objects. Deleting a Doctor should never silently wipe these out —
    // if any exist, the FK constraint will reject the delete instead
    // (GlobalExceptionHandler turns that into a 409).
    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "doctor")
    private List<WorkingSchedule> workingSchedules;

    // Same reasoning — RecordTreatment rows are medical history, not owned
    // sub-objects of Doctor.
    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "doctor")
    private List<RecordTreatment> recordTreatments;
}
