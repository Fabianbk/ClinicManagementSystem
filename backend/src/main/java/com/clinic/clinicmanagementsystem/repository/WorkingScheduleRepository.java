package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.WorkingSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface WorkingScheduleRepository extends JpaRepository<WorkingSchedule, Integer> {
    List<WorkingSchedule> findByDoctor_DoctorId(int doctorId);

    @Query("SELECT COUNT(ws) > 0 FROM WorkingSchedule ws WHERE ws.doctor.doctorId = :doctorId " +
           "AND (:excludeScheduleId IS NULL OR ws.scheduleId <> :excludeScheduleId) " +
           "AND ws.shiftStart < :shiftEnd AND ws.shiftEnd > :shiftStart")
    boolean existsOverlappingSchedule(
            @Param("doctorId") int doctorId,
            @Param("shiftStart") Date shiftStart,
            @Param("shiftEnd") Date shiftEnd,
            @Param("excludeScheduleId") Integer excludeScheduleId);
}

