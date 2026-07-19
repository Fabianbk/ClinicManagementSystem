package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.common.PageResponse;
import com.clinic.clinicmanagementsystem.dto.AppointmentRequestDTO;
import com.clinic.clinicmanagementsystem.dto.AppointmentResponseDTO;
import com.clinic.clinicmanagementsystem.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> book(
            @Valid @RequestBody AppointmentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(appointmentService.book(dto),
                        "Appointment booked successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> getById(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponseDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AppointmentResponseDTO> result =
                appointmentService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponseDTO>>> getByPatientId(
            @PathVariable int patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AppointmentResponseDTO> result =
                appointmentService.getByPatientId(patientId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> cancel(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.cancel(id), "Appointment cancelled successfully"));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> complete(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.complete(id), "Appointment marked as completed"));
    }

    @PatchMapping("/{id}/no-show")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> noShow(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.noShow(id), "Appointment marked as no-show"));
    }
}
