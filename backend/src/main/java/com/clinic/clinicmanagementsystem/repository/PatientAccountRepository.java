package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.PatientAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientAccountRepository extends JpaRepository<PatientAccount, String> {
    Optional<PatientAccount> findByPatient_PatientId(int patientId);
    boolean existsByPatient_PatientId(int patientId);

    @Query("SELECT pa FROM PatientAccount pa JOIN pa.patient p " +
           "WHERE pa.username = :loginId " +
           "OR (:patientId IS NOT NULL AND p.patientId = :patientId) " +
           "OR (p.mobileNumber IS NOT NULL AND p.mobileNumber = :loginId) " +
           "OR (p.email IS NOT NULL AND LOWER(p.email) = LOWER(:loginId))")
    List<PatientAccount> findByLoginIdentifier(@Param("loginId") String loginId, @Param("patientId") Integer patientId);
}
