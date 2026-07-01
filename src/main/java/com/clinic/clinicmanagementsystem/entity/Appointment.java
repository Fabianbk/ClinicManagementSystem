package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int appointmentId;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @OneToOne
    @JoinColumn(name = "slot_id", nullable = false, unique = true)
    private AppointmentSlot appointmentSlot;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // cascade intentionally does NOT include REMOVE: a RecordTreatment is the
    // actual clinical record of what happened during the visit. Deleting an
    // Appointment that already has treatment notes attached will now fail on
    // the FK constraint (RecordTreatment.appointment is nullable = false)
    // instead of silently destroying the medical record.
    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "appointment")
    private RecordTreatment recordTreatment;
}
