package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.PatientAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientAccountRepository extends JpaRepository<PatientAccount, String> {
    Optional<PatientAccount> findByPatient_PatientId(int patientId);
    boolean existsByPatient_PatientId(int patientId);
}
