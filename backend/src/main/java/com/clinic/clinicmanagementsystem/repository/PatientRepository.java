package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
    boolean existsByNationalId(String nationalId);
    boolean existsByPassportNo(String passportNo);

    Optional<Patient> findByNationalId(String nationalId);
    Optional<Patient> findByPassportNo(String passportNo);
}
