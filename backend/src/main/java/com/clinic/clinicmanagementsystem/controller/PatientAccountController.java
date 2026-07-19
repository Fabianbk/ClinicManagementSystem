package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.dto.PatientAccountRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientAccountResponseDTO;
import com.clinic.clinicmanagementsystem.service.PatientAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient-accounts")
@RequiredArgsConstructor
public class PatientAccountController {

    private final PatientAccountService patientAccountService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientAccountResponseDTO>> create(
            @Valid @RequestBody PatientAccountRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(patientAccountService.create(dto),
                        "Patient account registered successfully"));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<ApiResponse<PatientAccountResponseDTO>> getByPatientId(
            @PathVariable int patientId) {
        return ResponseEntity.ok(ApiResponse.success(patientAccountService.getByPatientId(patientId)));
    }
}