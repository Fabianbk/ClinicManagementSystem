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
@Table(name = "appointment_slots")
public class AppointmentSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int slotId;

    @Column(name = "start_time", nullable = false)
    private Date startTime;

    @Column(name = "end_time", nullable = false)
    private Date endTime;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    private WorkingSchedule workingSchedule;

    // cascade intentionally does NOT include REMOVE: once a slot has a real
    // booked Appointment, deleting the slot should never silently delete the
    // appointment (and everything hanging off it) along with it. The FK on
    // Appointment.appointmentSlot (nullable = false) will reject the delete
    // instead — this is the actual choke point that stops the Doctor/
    // WorkingSchedule cascade chain from reaching Appointment/RecordTreatment.
    @OneToOne(mappedBy = "appointmentSlot", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private Appointment appointment;
}
