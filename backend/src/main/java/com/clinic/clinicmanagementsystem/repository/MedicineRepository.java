package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Integer> {
    boolean existsByMedicineNameIgnoreCase(String medicineName);

    Page<Medicine> findByIsActiveTrue(Pageable pageable);

    List<Medicine> findByIsActiveTrue();
}
