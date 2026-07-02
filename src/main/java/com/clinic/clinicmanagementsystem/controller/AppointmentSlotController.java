package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.dto.AppointmentSlotRequestDTO;
import com.clinic.clinicmanagementsystem.dto.AppointmentSlotResponseDTO;
import com.clinic.clinicmanagementsystem.enums.AppointmentSlotStatus;
import com.clinic.clinicmanagementsystem.service.AppointmentSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointment-slots")
@RequiredArgsConstructor
public class AppointmentSlotController {

    private final AppointmentSlotService appointmentSlotService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentSlotResponseDTO>> create(
            @Valid @RequestBody AppointmentSlotRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(appointmentSlotService.create(dto),
                        "Appointment slot created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentSlotResponseDTO>> getById(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentSlotService.getById(id)));
    }

    /** All slots for a schedule (any status) — for doctor/admin views. */
    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<ApiResponse<List<AppointmentSlotResponseDTO>>> getByScheduleId(
            @PathVariable int scheduleId) {
        return ResponseEntity.ok(
                ApiResponse.success(appointmentSlotService.getByScheduleId(scheduleId)));
    }

    /** Available slots only — the list shown to patients when booking. */
    @GetMapping("/schedule/{scheduleId}/available")
    public ResponseEntity<ApiResponse<List<AppointmentSlotResponseDTO>>> getAvailableByScheduleId(
            @PathVariable int scheduleId) {
        return ResponseEntity.ok(
                ApiResponse.success(appointmentSlotService.getAvailableByScheduleId(scheduleId)));
    }

    /** Block or unblock a slot. Cannot be used to manually set BOOKED. */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentSlotResponseDTO>> updateStatus(
            @PathVariable int id, @RequestParam AppointmentSlotStatus status) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentSlotService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        appointmentSlotService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
