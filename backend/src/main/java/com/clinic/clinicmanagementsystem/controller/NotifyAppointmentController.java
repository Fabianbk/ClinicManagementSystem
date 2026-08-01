package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.dto.NotifyAppointmentResponseDTO;
import com.clinic.clinicmanagementsystem.service.NotifyAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class NotifyAppointmentController {

    private final NotifyAppointmentService notifyAppointmentService;

    /** Notify Appointment — upcoming, still-scheduled appointments for a patient. */
    @GetMapping("/patient/{patientId}/notifications")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<ApiResponse<List<NotifyAppointmentResponseDTO>>> getUpcoming(
            @PathVariable int patientId) {
        return ResponseEntity.ok(
                ApiResponse.success(notifyAppointmentService.getUpcomingForPatient(patientId)));
    }
}