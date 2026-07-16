package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkingScheduleRequestDTO {

    @NotNull(message = "Doctor ID is required")
    private Integer doctorId;

    @NotNull(message = "Date is required")
    private Date date;

    @NotNull(message = "Shift start time is required")
    private Date shiftStart;

    @NotNull(message = "Shift end time is required")
    private Date shiftEnd;
}
