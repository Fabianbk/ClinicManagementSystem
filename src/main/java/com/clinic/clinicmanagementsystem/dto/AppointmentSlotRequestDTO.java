package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Status is required")
    @Size(max = 50)
    private String status;
}
