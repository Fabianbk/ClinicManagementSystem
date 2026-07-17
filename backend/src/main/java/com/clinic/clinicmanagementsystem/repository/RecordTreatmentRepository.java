package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.RecordTreatment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecordTreatmentRepository extends JpaRepository<RecordTreatment, Integer> {
    Optional<RecordTreatment> findByAppointment_AppointmentId(int appointmentId);
    Page<RecordTreatment> findByAppointment_Patient_PatientId(int patientId, Pageable pageable);
}