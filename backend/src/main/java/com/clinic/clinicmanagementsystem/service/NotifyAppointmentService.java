package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.NotifyAppointmentResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Appointment;
import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import com.clinic.clinicmanagementsystem.repository.AppointmentRepository;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Notify Appointment Pull-based: the frontend calls this (e.g.
 * on login / dashboard load, or on a poll interval) rather than the backend
 * pushing anything, since there's no email/SMS provider wired up yet.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotifyAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CurrentUser currentUser;

    public List<NotifyAppointmentResponseDTO> getUpcomingForPatient(int patientId) {
        currentUser.requireSelfOrDoctor(patientId);

        List<Appointment> upcoming = appointmentRepository
                .findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeAsc(
                        patientId, AppointmentStatus.SCHEDULED, new Date());

        // Alternate flow : no matching appointments just means an
        // empty list here, consistent with how AppointmentService /
        // RecordTreatmentService handle "no results" for list endpoints —
        // the frontend shows its own empty state rather than the backend
        // throwing 404 for "nothing to notify about."
        return upcoming.stream().map(this::toDto).collect(Collectors.toList());
    }

    private NotifyAppointmentResponseDTO toDto(Appointment appointment) {
        Date startTime = appointment.getAppointmentSlot().getStartTime();

        return NotifyAppointmentResponseDTO.builder()
                .appointmentId(appointment.getAppointmentId())
                .status(appointment.getStatus())
                .slotStartTime(startTime)
                .slotEndTime(appointment.getAppointmentSlot().getEndTime())
                .doctorId(appointment.getAppointmentSlot().getWorkingSchedule().getDoctor().getDoctorId())
                .doctorFullname(appointment.getAppointmentSlot().getWorkingSchedule().getDoctor().getFullname())
                .message(buildMessage(startTime))
                .build();
    }

    private String buildMessage(Date startTime) {
        long millisUntil = startTime.getTime() - System.currentTimeMillis();
        long hoursUntil = TimeUnit.MILLISECONDS.toHours(millisUntil);

        if (hoursUntil < 1) {
            long minutesUntil = TimeUnit.MILLISECONDS.toMinutes(millisUntil);
            return "Your appointment starts in " + Math.max(minutesUntil, 0) + " minute(s)";
        }
        if (hoursUntil < 24) {
            return "Your appointment is in " + hoursUntil + " hour(s)";
        }
        long daysUntil = TimeUnit.MILLISECONDS.toDays(millisUntil);
        return "Your appointment is in " + daysUntil + " day(s)";
    }
}