package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.AppointmentSlot;
import com.clinic.clinicmanagementsystem.enums.AppointmentSlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Integer> {
    List<AppointmentSlot> findByWorkingSchedule_ScheduleId(int scheduleId);

    // status param is now the correct enum type — the old String version would
    // have caused a type mismatch at runtime once AppointmentSlot.status
    // became an enum.
    List<AppointmentSlot> findByWorkingSchedule_ScheduleIdAndStatus(
            int scheduleId, AppointmentSlotStatus status);
}
