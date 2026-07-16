package com.clinic.clinicmanagementsystem.dto;

import com.clinic.clinicmanagementsystem.enums.AppointmentSlotStatus;
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
public class AppointmentSlotRequestDTO {

    @NotNull(message = "Working schedule ID is required")
    private Integer scheduleId;

    @NotNull(message = "Start time is required")
    private Date startTime;

    @NotNull(message = "End time is required")
    private Date endTime;

    @NotNull(message = "Status is required")
    private AppointmentSlotStatus status;
}
