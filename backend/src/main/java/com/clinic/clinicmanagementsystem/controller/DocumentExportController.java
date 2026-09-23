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
     * Export Continued Visit Intake Form (.docx) by recordTreatmentId.
     */
    @GetMapping("/intake-form/treatment/{recordTreatmentId}/continued")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<byte[]> exportIntakeFormContinuedByTreatment(@PathVariable int recordTreatmentId) {
        byte[] docx = documentExportService.exportClientIntakeContinued(recordTreatmentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "continued-intake-" + recordTreatmentId + ".docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }

    /**
     * Export Blank Thai Patient Intake Form (.docx).
     */
    @GetMapping("/blank/intake-th")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<byte[]> exportBlankPatientIntakeTh() {
        byte[] docx = documentExportService.exportBlankPatientIntakeTh();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "blank-patient-intake-th.docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }

    /**
     * Export Blank English Patient Intake Form (.docx).
     */
    @GetMapping("/blank/intake-en")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<byte[]> exportBlankPatientIntakeEn() {
        byte[] docx = documentExportService.exportBlankPatientIntakeEn();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "blank-patient-intake-en.docx");

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

    /**
     * Export Thai Patient Intake Form (.docx) by patientId.
     */
    @GetMapping("/patient/{patientId}/intake-th")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<byte[]> exportPatientIntakeTh(@PathVariable int patientId) {
        byte[] docx = documentExportService.exportPatientIntakeTh(patientId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "patient-intake-th-" + patientId + ".docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }

    /**
     * Export English Patient Personal Data (.docx) by patientId.
     */
    @GetMapping("/patient/{patientId}/intake-en")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<byte[]> exportPatientIntakeEn(@PathVariable int patientId) {
        byte[] docx = documentExportService.exportPatientIntakeEn(patientId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "patient-intake-en-" + patientId + ".docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }

    /**
     * Export OPD Card (.docx) by patientId.
     */
    @GetMapping("/patient/{patientId}/opd-card")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<byte[]> exportOpdCard(@PathVariable int patientId) {
        byte[] docx = documentExportService.exportOpdCard(patientId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "opd-card-" + patientId + ".docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }

    /**
     * Export Medical Certificate (ใบรับรองแพทย์) (.docx) by recordTreatmentId.
     */
    @GetMapping("/medical-certificate/{recordTreatmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<byte[]> exportMedicalCertificate(
            @PathVariable int recordTreatmentId,
            @RequestParam(required = false) Integer sickLeaveDays,
            @RequestParam(required = false) String sickLeaveFrom,
            @RequestParam(required = false) String sickLeaveTo) {
        byte[] docx = documentExportService.exportMedicalCertificate(recordTreatmentId, sickLeaveDays, sickLeaveFrom, sickLeaveTo);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(DOCX_MEDIA_TYPE));
        headers.setContentDispositionFormData("attachment", "medical-certificate-" + recordTreatmentId + ".docx");

        return ResponseEntity.ok().headers(headers).body(docx);
    }
}

