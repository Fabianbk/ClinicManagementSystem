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
public class WorkingScheduleResponseDTO {
    private int scheduleId;
    private Date date;
    private Date shiftStart;
    private Date shiftEnd;

    private int doctorId;
    private String doctorFullname;
}
