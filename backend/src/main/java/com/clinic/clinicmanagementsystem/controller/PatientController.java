package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.common.PageResponse;
import com.clinic.clinicmanagementsystem.dto.ContactPersonRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ContactPersonResponseDTO;
import com.clinic.clinicmanagementsystem.dto.HealthProfileRequestDTO;
import com.clinic.clinicmanagementsystem.dto.HealthProfileResponseDTO;
import com.clinic.clinicmanagementsystem.dto.PatientRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientResponseDTO;
import com.clinic.clinicmanagementsystem.dto.PrincipleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PrincipleResponseDTO;
import com.clinic.clinicmanagementsystem.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> createPatient(
            @Valid @RequestBody PatientRequestDTO dto) {
        PatientResponseDTO created = patientService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Patient created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> getPatient(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PageResponse<PatientResponseDTO>>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PatientResponseDTO> result = patientService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> updateBasicInfo(
            @PathVariable int id, @Valid @RequestBody PatientRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                patientService.updateBasicInfo(id, dto), "Patient updated successfully"));
    }

    @PutMapping("/{id}/principle")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PrincipleResponseDTO>> updatePrinciple(
            @PathVariable int id, @Valid @RequestBody PrincipleRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(patientService.updatePrinciple(id, dto)));
    }

    @PutMapping("/{id}/health-profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<HealthProfileResponseDTO>> updateHealthProfile(
            @PathVariable int id, @Valid @RequestBody HealthProfileRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(patientService.updateHealthProfile(id, dto)));
    }

    @PostMapping("/{id}/contact-persons")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<ContactPersonResponseDTO>> addContactPerson(
            @PathVariable int id, @Valid @RequestBody ContactPersonRequestDTO dto) {
        ContactPersonResponseDTO created = patientService.addContactPerson(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @DeleteMapping("/{id}/contact-persons/{contactId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> removeContactPerson(
            @PathVariable int id, @PathVariable int contactId) {
        patientService.removeContactPerson(id, contactId);
        return ResponseEntity.ok(ApiResponse.success(null, "Contact person removed successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable int id) {
        patientService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Patient deleted successfully"));
    }
}
