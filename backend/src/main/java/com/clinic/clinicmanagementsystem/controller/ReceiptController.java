package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.dto.ReceiptRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ReceiptResponseDTO;
import com.clinic.clinicmanagementsystem.service.ReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReceiptResponseDTO>> issue(
            @Valid @RequestBody ReceiptRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(receiptService.issue(dto), "Receipt issued successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReceiptResponseDTO>> getById(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(receiptService.getById(id)));
    }

    @GetMapping("/record-treatment/{recordTreatmentId}")
    public ResponseEntity<ApiResponse<ReceiptResponseDTO>> getByRecordTreatmentId(
            @PathVariable int recordTreatmentId) {
        return ResponseEntity.ok(
                ApiResponse.success(receiptService.getByRecordTreatmentId(recordTreatmentId)));
    }
}