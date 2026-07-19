package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Page<Review> findByPatient_PatientId(int patientId, Pageable pageable);

    Optional<Review> findFirstByPatient_PatientId(int patientId);

    boolean existsByPatient_PatientId(int patientId);
}