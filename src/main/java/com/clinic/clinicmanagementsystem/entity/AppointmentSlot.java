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

    @OneToOne(mappedBy = "appointmentSlot", cascade = CascadeType.ALL)
    private Appointment appointment;
}
