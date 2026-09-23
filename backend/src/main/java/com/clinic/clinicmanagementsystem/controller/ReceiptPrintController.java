package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.dto.RecordTreatmentResponseDTO;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import com.clinic.clinicmanagementsystem.service.DocumentExportService;
import com.clinic.clinicmanagementsystem.service.RecordTreatmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ReceiptPrintController {

    private final RecordTreatmentService recordTreatmentService;
    private final DocumentExportService documentExportService;
    private final CurrentUser currentUser;

    private static final String DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    /**
     * Export Treatment Order & Billing as Word (.docx) by recordTreatmentId.
     * Legacy receipt print endpoint now delivers the official unified treatment order.
     */
    @GetMapping("/api/receipts/record-treatment/{recordTreatmentId}/print")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<byte[]> printReceipt(@PathVariable int recordTreatmentId) {
        RecordTreatmentResponseDTO treatment = recordTreatmentService.getById(recordTreatmentId);
        currentUser.requireSelfOrDoctor(treatment.getPatientId());

        byte[] docx = documentExportService.exportTreatmentOrder(recordTreatmentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "treatment-order-" + recordTreatmentId + ".docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }
}