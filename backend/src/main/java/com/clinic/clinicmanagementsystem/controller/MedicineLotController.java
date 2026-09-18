package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.dto.MedicineLotRequestDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineLotResponseDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineResponseDTO;
import com.clinic.clinicmanagementsystem.dto.StockAdjustmentRequestDTO;
import com.clinic.clinicmanagementsystem.service.MedicineLotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicine-lots")
@RequiredArgsConstructor
public class MedicineLotController {

    private final MedicineLotService medicineLotService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<MedicineLotResponseDTO>> receiveStock(
            @Valid @RequestBody MedicineLotRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(medicineLotService.receiveStock(dto),
                        "Stock received into new lot successfully"));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<MedicineResponseDTO>> adjustStock(
            @Valid @RequestBody StockAdjustmentRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                medicineLotService.adjustStock(dto), "Stock adjusted successfully"));
    }

    @GetMapping("/medicine/{medicineId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<MedicineLotResponseDTO>>> getLotsByMedicine(
            @PathVariable int medicineId) {
        return ResponseEntity.ok(ApiResponse.success(
                medicineLotService.getLotsByMedicineId(medicineId)));
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<MedicineLotResponseDTO>>> getExpiringLots(
            @RequestParam(defaultValue = "60") int days) {
        return ResponseEntity.ok(ApiResponse.success(
                medicineLotService.getExpiringLots(days)));
    }

    @DeleteMapping("/{lotId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteLot(@PathVariable int lotId) {
        medicineLotService.deleteLot(lotId);
        return ResponseEntity.ok(ApiResponse.success(null, "Medicine lot deleted successfully"));
    }
}
