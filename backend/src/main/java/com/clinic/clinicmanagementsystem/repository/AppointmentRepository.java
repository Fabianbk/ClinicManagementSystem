package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.Appointment;
import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    Page<Appointment> findByPatient_PatientId(int patientId, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentSlot.workingSchedule.doctor.doctorId = :doctorId")
    Page<Appointment> findByDoctorId(@Param("doctorId") int doctorId, Pageable pageable);

    // Notify Appointment : only future, still-scheduled visits
    // are worth notifying about — cancelled/completed/no-show appointments
    // are excluded, and the ORDER BY gives the soonest appointment first.
    List<Appointment> findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeAsc(
            int patientId, AppointmentStatus status, Date now);
}