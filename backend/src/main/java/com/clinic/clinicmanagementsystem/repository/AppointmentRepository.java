package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.Appointment;
import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    Page<Appointment> findByPatient_PatientId(int patientId, Pageable pageable);

    Page<Appointment> findByAppointmentSlot_WorkingSchedule_Doctor_DoctorId(int doctorId, Pageable pageable);

    // Notify Appointment : only future, still-scheduled visits
    // are worth notifying about — cancelled/completed/no-show appointments
    // are excluded, and the ORDER BY gives the soonest appointment first.
    List<Appointment> findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeAsc(
            int patientId, AppointmentStatus status, Date now);
}