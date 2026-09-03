package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
    boolean existsByNationalId(String nationalId);
    boolean existsByPassportNo(String passportNo);

    Optional<Patient> findByNationalId(String nationalId);
    Optional<Patient> findByPassportNo(String passportNo);

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.fullname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "p.mobileNumber LIKE CONCAT('%', :query, '%') OR " +
           "p.nationalId LIKE CONCAT('%', :query, '%') OR " +
           "p.passportNo LIKE CONCAT('%', :query, '%')")
    Page<Patient> searchPatients(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Patient p WHERE " +
           "p.patientId = :idQuery OR " +
           "LOWER(p.fullname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "p.mobileNumber LIKE CONCAT('%', :query, '%') OR " +
           "p.nationalId LIKE CONCAT('%', :query, '%') OR " +
           "p.passportNo LIKE CONCAT('%', :query, '%')")
    Page<Patient> searchPatientsWithId(@Param("query") String query, @Param("idQuery") int idQuery, Pageable pageable);
}

