package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.common.PageResponse;
import com.clinic.clinicmanagementsystem.dto.ReviewRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ReviewResponseDTO;
import com.clinic.clinicmanagementsystem.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> create(
            @Valid @RequestBody ReviewRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(reviewService.create(dto), "Review submitted successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> getById(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getById(id)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> getByPatientId(@PathVariable int patientId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getByPatientId(patientId)));
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponseDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ReviewResponseDTO> result = reviewService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> update(
            @PathVariable int id, @Valid @RequestBody ReviewRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                reviewService.update(id, dto), "Review updated successfully"));
    }
}