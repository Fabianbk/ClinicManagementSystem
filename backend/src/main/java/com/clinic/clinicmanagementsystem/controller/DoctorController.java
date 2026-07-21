package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.common.PageResponse;
import com.clinic.clinicmanagementsystem.dto.DoctorChangePasswordRequestDTO;
import com.clinic.clinicmanagementsystem.dto.DoctorRequestDTO;
import com.clinic.clinicmanagementsystem.dto.DoctorResponseDTO;
import com.clinic.clinicmanagementsystem.dto.DoctorUpdateRequestDTO;
import com.clinic.clinicmanagementsystem.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> createDoctor(
            @Valid @RequestBody DoctorRequestDTO dto) {
        DoctorResponseDTO created = doctorService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Doctor created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> getDoctor(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<PageResponse<DoctorResponseDTO>>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DoctorResponseDTO> result = doctorService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> updateProfile(
            @PathVariable int id, @Valid @RequestBody DoctorUpdateRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorService.updateProfile(id, dto), "Doctor profile updated successfully"));
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable int id, @Valid @RequestBody DoctorChangePasswordRequestDTO dto) {
        doctorService.changePassword(id, dto);
        return ResponseEntity.ok(ApiResponse.success(null, "Password updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable int id) {
        doctorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
