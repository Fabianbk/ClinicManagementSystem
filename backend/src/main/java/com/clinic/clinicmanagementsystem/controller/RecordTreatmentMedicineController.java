package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineResponseDTO;
import com.clinic.clinicmanagementsystem.service.RecordTreatmentMedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/record-treatment-medicines")
@RequiredArgsConstructor
public class RecordTreatmentMedicineController {

    private final RecordTreatmentMedicineService recordTreatmentMedicineService;

    @PostMapping
    public ResponseEntity<ApiResponse<RecordTreatmentMedicineResponseDTO>> add(
            @Valid @RequestBody RecordTreatmentMedicineRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(recordTreatmentMedicineService.add(dto),
                        "Medicine dispensed successfully"));
    }

    @GetMapping("/record-treatment/{recordTreatmentId}")
    public ResponseEntity<ApiResponse<List<RecordTreatmentMedicineResponseDTO>>> getByRecordTreatmentId(
            @PathVariable int recordTreatmentId) {
        return ResponseEntity.ok(ApiResponse.success(
                recordTreatmentMedicineService.getByRecordTreatmentId(recordTreatmentId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable int id) {
        recordTreatmentMedicineService.remove(id);
        return ResponseEntity.noContent().build();
    }
}