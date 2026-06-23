package com.clinic.clinicmanagementsystem.dto;

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
    private String status;

    private int patientId;
    private String patientFullname;

    private int slotId;
    private Date slotStartTime;
    private Date slotEndTime;

    private int doctorId;
    private String doctorFullname;
}
