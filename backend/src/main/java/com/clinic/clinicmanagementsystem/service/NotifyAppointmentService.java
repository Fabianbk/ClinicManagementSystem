package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.NotifyAppointmentResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Appointment;
import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import com.clinic.clinicmanagementsystem.repository.AppointmentRepository;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Notify Appointment (Zero-Entity computed notification service):
 * Queries real-time appointment records and dynamically formats advance reminders
 * (including 3-day advance window) and recent cancellation status alerts.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotifyAppointmentService {

    private static final String[] THAI_MONTHS = {
            "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
            "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    };

    private final AppointmentRepository appointmentRepository;
    private final CurrentUser currentUser;

    public List<NotifyAppointmentResponseDTO> getUpcomingForPatient(int patientId) {
        currentUser.requireSelfOrDoctor(patientId);

        Date now = new Date();

        // 1. Upcoming scheduled visits (future appointments)
        List<Appointment> upcoming = appointmentRepository
                .findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeAsc(
                        patientId, AppointmentStatus.SCHEDULED, now);

        // 2. Recent cancellations (within the past 7 days or upcoming cancelled slots)
        Date sevenDaysAgo = new Date(now.getTime() - (7L * 24 * 60 * 60 * 1000));
        List<Appointment> cancelled = appointmentRepository
                .findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeDesc(
                        patientId, AppointmentStatus.CANCELLED, sevenDaysAgo);

        List<NotifyAppointmentResponseDTO> result = new ArrayList<>();
        result.addAll(upcoming.stream().map(a -> toScheduledDto(a, now)).collect(Collectors.toList()));
        result.addAll(cancelled.stream().map(this::toCancelledDto).collect(Collectors.toList()));

        // Prioritize: urgent notifications first, then sorted by slot start time
        result.sort((a, b) -> {
            if (a.isUrgent() != b.isUrgent()) {
                return a.isUrgent() ? -1 : 1;
            }
            if (a.getSlotStartTime() != null && b.getSlotStartTime() != null) {
                return a.getSlotStartTime().compareTo(b.getSlotStartTime());
            }
            return 0;
        });

        return result;
    }

    private NotifyAppointmentResponseDTO toScheduledDto(Appointment appointment, Date now) {
        Date startTime = appointment.getAppointmentSlot().getStartTime();
        Date endTime = appointment.getAppointmentSlot().getEndTime();
        int doctorId = appointment.getAppointmentSlot().getWorkingSchedule().getDoctor().getDoctorId();
        String doctorFullname = appointment.getAppointmentSlot().getWorkingSchedule().getDoctor().getFullname();
        String formattedDoctor = formatDoctorName(doctorFullname);

        long millisUntil = startTime.getTime() - now.getTime();
        long daysUntil = TimeUnit.MILLISECONDS.toDays(millisUntil);
        long hoursUntil = TimeUnit.MILLISECONDS.toHours(millisUntil);
        boolean isWithin3Days = millisUntil <= (3L * 24 * 60 * 60 * 1000) && millisUntil >= 0;

        String notificationType = isWithin3Days ? "REMINDER_3_DAYS" : "REMINDER_UPCOMING";
        String title = isWithin3Days ? "เตือนนัดหมายตรวจรักษา (ใกล้ถึงวันนัด)" : "นัดหมายตรวจรักษาที่กำลังจะมาถึง";

        String message;
        if (hoursUntil < 1) {
            long minutes = Math.max(TimeUnit.MILLISECONDS.toMinutes(millisUntil), 1);
            message = String.format("คุณมีนัดตรวจกับ %s ในอีก %d นาที (%s)", formattedDoctor, minutes, formatThaiDateTime(startTime));
        } else if (hoursUntil < 24) {
            message = String.format("คุณมีนัดตรวจกับ %s ในอีก %d ชั่วโมง (%s)", formattedDoctor, hoursUntil, formatThaiDateTime(startTime));
        } else if (daysUntil == 1) {
            message = String.format("คุณมีนัดตรวจกับ %s ในวันพรุ่งนี้ (%s)", formattedDoctor, formatThaiDateTime(startTime));
        } else if (daysUntil <= 3) {
            message = String.format("คุณมีนัดตรวจกับ %s ในอีก %d วัน (%s)", formattedDoctor, daysUntil, formatThaiDateTime(startTime));
        } else {
            message = String.format("คุณมีนัดตรวจกับ %s ในวันที่ %s", formattedDoctor, formatThaiDateTime(startTime));
        }

        return NotifyAppointmentResponseDTO.builder()
                .notificationId("reminder-" + appointment.getAppointmentId())
                .appointmentId(appointment.getAppointmentId())
                .status(appointment.getStatus())
                .slotStartTime(startTime)
                .slotEndTime(endTime)
                .doctorId(doctorId)
                .doctorFullname(doctorFullname)
                .notificationType(notificationType)
                .title(title)
                .message(message)
                .isUrgent(isWithin3Days)
                .linkUrl("/patient/appointments")
                .createdAt(startTime)
                .build();
    }

    private NotifyAppointmentResponseDTO toCancelledDto(Appointment appointment) {
        Date startTime = appointment.getAppointmentSlot().getStartTime();
        Date endTime = appointment.getAppointmentSlot().getEndTime();
        int doctorId = appointment.getAppointmentSlot().getWorkingSchedule().getDoctor().getDoctorId();
        String doctorFullname = appointment.getAppointmentSlot().getWorkingSchedule().getDoctor().getFullname();
        String formattedDoctor = formatDoctorName(doctorFullname);

        String message = String.format("นัดหมายวันที่ %s กับ %s ได้รับการยกเลิกแล้ว",
                formatThaiDateTime(startTime), formattedDoctor);

        return NotifyAppointmentResponseDTO.builder()
                .notificationId("status-" + appointment.getAppointmentId() + "-CANCELLED")
                .appointmentId(appointment.getAppointmentId())
                .status(appointment.getStatus())
                .slotStartTime(startTime)
                .slotEndTime(endTime)
                .doctorId(doctorId)
                .doctorFullname(doctorFullname)
                .notificationType("STATUS_CANCELLED")
                .title("การนัดหมายถูกยกเลิก")
                .message(message)
                .isUrgent(true)
                .linkUrl("/patient/appointments")
                .createdAt(startTime)
                .build();
    }

    private String formatDoctorName(String fullname) {
        if (fullname == null || fullname.isBlank()) {
            return "แพทย์แผนไทย";
        }
        String clean = fullname.trim();
        if (clean.startsWith("พท.") || clean.startsWith("พท.ป.") || clean.startsWith("พท.ว.") || clean.startsWith("นพ.") || clean.startsWith("พญ.")) {
            return clean;
        }
        return "พท. " + clean;
    }

    private String formatThaiDateTime(Date date) {
        if (date == null) return "";
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        int day = cal.get(Calendar.DAY_OF_MONTH);
        int month = cal.get(Calendar.MONTH);
        int year = cal.get(Calendar.YEAR) + 543;
        SimpleDateFormat timeFmt = new SimpleDateFormat("HH:mm");
        return String.format("%d %s %d เวลา %s น.", day, THAI_MONTHS[month], year, timeFmt.format(date));
    }
}