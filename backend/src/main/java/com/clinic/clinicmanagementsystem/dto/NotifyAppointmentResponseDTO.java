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

    /** Human-readable reminder text, e.g. "Your appointment is in 3 hours". */
    private String message;
}