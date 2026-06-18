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

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "appointment")
    private RecordTreatment recordTreatment;
}
