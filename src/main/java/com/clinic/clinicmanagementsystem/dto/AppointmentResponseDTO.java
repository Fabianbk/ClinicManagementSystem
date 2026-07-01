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
public class AppointmentResponseDTO {
    private int appointmentId;
    private AppointmentStatus status;

    private int patientId;
    private String patientFullname;

    private int slotId;
    private Date slotStartTime;
    private Date slotEndTime;

    private int doctorId;
    private String doctorFullname;
}
