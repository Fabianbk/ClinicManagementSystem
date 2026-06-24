package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Integer> {
    List<AppointmentSlot> findByWorkingSchedule_ScheduleId(int scheduleId);
    List<AppointmentSlot> findByWorkingSchedule_ScheduleIdAndStatus(int scheduleId, String status);
}
