package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.common.PageResponse;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentRequestDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentResponseDTO;
import com.clinic.clinicmanagementsystem.service.RecordTreatmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/record-treatments")
@RequiredArgsConstructor
public class RecordTreatmentController {

    private final RecordTreatmentService recordTreatmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<RecordTreatmentResponseDTO>> create(
            @Valid @RequestBody RecordTreatmentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(recordTreatmentService.create(dto),
                        "Treatment record added successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecordTreatmentResponseDTO>> getById(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(recordTreatmentService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RecordTreatmentResponseDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<RecordTreatmentResponseDTO> result =
                recordTreatmentService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<PageResponse<RecordTreatmentResponseDTO>>> getByPatientId(
            @PathVariable int patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<RecordTreatmentResponseDTO> result =
                recordTreatmentService.getByPatientId(patientId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<RecordTreatmentResponseDTO>> getByAppointmentId(
            @PathVariable int appointmentId) {
        return ResponseEntity.ok(
                ApiResponse.success(recordTreatmentService.getByAppointmentId(appointmentId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecordTreatmentResponseDTO>> update(
            @PathVariable int id, @Valid @RequestBody RecordTreatmentRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                recordTreatmentService.update(id, dto), "Treatment record updated successfully"));
    }
}