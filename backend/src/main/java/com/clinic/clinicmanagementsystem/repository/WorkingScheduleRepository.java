package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.WorkingSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkingScheduleRepository extends JpaRepository<WorkingSchedule, Integer> {
    List<WorkingSchedule> findByDoctor_DoctorId(int doctorId);
}
