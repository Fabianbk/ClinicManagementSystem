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
public class AppointmentSlotResponseDTO {
    private int slotId;
    private Date startTime;
    private Date endTime;
    private String status;

    private int scheduleId;
    private int doctorId;
    private String doctorFullname;
}
