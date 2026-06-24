package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.HealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthProfileRepository extends JpaRepository<HealthProfile, Integer> {
}
