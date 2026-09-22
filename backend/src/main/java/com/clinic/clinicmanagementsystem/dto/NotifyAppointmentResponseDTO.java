package com.clinic.clinicmanagementsystem.dto;

import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotifyAppointmentResponseDTO {
    private int appointmentId;
    private AppointmentStatus status;

    private Date slotStartTime;
    private Date slotEndTime;

    private int doctorId;
    private String doctorFullname;

    /** Synthetic unique ID for client-side read tracking (e.g. "reminder-5", "cancel-7"). */
    private String notificationId;

    /** Notification category: "REMINDER_3_DAYS", "REMINDER_UPCOMING", "STATUS_CANCELLED". */
    private String notificationType;

    /** User-friendly Thai notification title. */
    private String title;

    /** Human-readable reminder/status text in Thai. */
    private String message;

    /** True when within the 3-day advance window or represents a cancelled appointment. */
    private boolean isUrgent;

    /** Direct navigation target for frontend popover item click (e.g. "/patient/appointments"). */
    private String linkUrl;

    /** Timestamp for ordering and relative time display. */
    private Date createdAt;
}