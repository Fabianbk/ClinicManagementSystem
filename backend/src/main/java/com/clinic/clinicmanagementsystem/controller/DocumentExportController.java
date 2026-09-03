package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.service.DocumentExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentExportController {

    private final DocumentExportService documentExportService;

    private static final String DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    /**
     * Export Client Intake Form (.docx) by patientId.
     */
    @GetMapping("/intake-form/patient/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<byte[]> exportIntakeFormByPatient(@PathVariable int patientId) {
        byte[] docx = documentExportService.exportClientIntakeForm(patientId, null);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "client-intake-patient-" + patientId + ".docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }

    /**
     * Export complete Client Intake Form & Treatment Record (.docx) by recordTreatmentId.
     */
    @GetMapping("/intake-form/treatment/{recordTreatmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<byte[]> exportIntakeFormByTreatment(@PathVariable int recordTreatmentId) {
        byte[] docx = documentExportService.exportClientIntakeForm(null, recordTreatmentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "treatment-record-" + recordTreatmentId + ".docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }

    /**
     * Export Treatment Order / Prescription (Page 5) (.docx) by recordTreatmentId.
     */
    @GetMapping("/treatment-order/{recordTreatmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<byte[]> exportTreatmentOrder(@PathVariable int recordTreatmentId) {
        byte[] docx = documentExportService.exportTreatmentOrder(recordTreatmentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "treatment-order-" + recordTreatmentId + ".docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }
}
