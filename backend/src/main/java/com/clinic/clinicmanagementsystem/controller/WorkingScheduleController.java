package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.common.PageResponse;
import com.clinic.clinicmanagementsystem.dto.WorkingScheduleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.WorkingScheduleResponseDTO;
import com.clinic.clinicmanagementsystem.service.WorkingScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/working-schedules")
@RequiredArgsConstructor
public class WorkingScheduleController {

    private final WorkingScheduleService workingScheduleService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<WorkingScheduleResponseDTO>> create(
            @Valid @RequestBody WorkingScheduleRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(workingScheduleService.create(dto),
                        "Working schedule created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<WorkingScheduleResponseDTO>> getById(@PathVariable int id) {
        return ResponseEntity.ok(ApiResponse.success(workingScheduleService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<PageResponse<WorkingScheduleResponseDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<WorkingScheduleResponseDTO> result =
                workingScheduleService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<List<WorkingScheduleResponseDTO>>> getByDoctorId(
            @PathVariable int doctorId) {
        return ResponseEntity.ok(ApiResponse.success(workingScheduleService.getByDoctorId(doctorId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<WorkingScheduleResponseDTO>> update(
            @PathVariable int id, @Valid @RequestBody WorkingScheduleRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                workingScheduleService.update(id, dto), "Working schedule updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        workingScheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
