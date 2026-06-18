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
@Table(name = "working_schedules")
public class WorkingSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int scheduleId;

    @Column(name = "date", nullable = false)
    private Date date;

    @Column(name = "shift_start", nullable = false)
    private Date shiftStart;

    @Column(name = "shift_end", nullable = false)
    private Date shiftEnd;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "workingSchedule")
    private List<AppointmentSlot> appointmentSlots;
}
