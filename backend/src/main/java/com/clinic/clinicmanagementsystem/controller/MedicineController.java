package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.common.PageResponse;
import com.clinic.clinicmanagementsystem.dto.MedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineResponseDTO;
import com.clinic.clinicmanagementsystem.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @PostMapping
    public ResponseEntity<ApiResponse<MedicineResponseDTO>> create(
            @Valid @RequestBody MedicineRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(medicineService.create(dto),
                        "Medicine added successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponseDTO>> getById(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MedicineResponseDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MedicineResponseDTO> result = medicineService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineResponseDTO>> update(
            @PathVariable int id, @Valid @RequestBody MedicineRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                medicineService.update(id, dto), "Medicine updated successfully"));
    }
}