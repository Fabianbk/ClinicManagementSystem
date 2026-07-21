package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineResponseDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentResponseDTO;
import com.clinic.clinicmanagementsystem.dto.ReceiptResponseDTO;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.service.ReceiptService;
import com.clinic.clinicmanagementsystem.service.RecordTreatmentMedicineService;
import com.clinic.clinicmanagementsystem.service.RecordTreatmentService;
import com.clinic.clinicmanagementsystem.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReceiptPrintController {

    private final ReceiptService receiptService;
    private final RecordTreatmentService recordTreatmentService;
    private final RecordTreatmentMedicineService recordTreatmentMedicineService;
    private final ReportService reportService;

    /** Print Receipt (SRS 3.1.25) — driven by recordTreatmentId, matching the rest of the Receipt API. */
    @GetMapping("/api/receipts/record-treatment/{recordTreatmentId}/print")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<byte[]> printReceipt(@PathVariable int recordTreatmentId) {
        ReceiptResponseDTO receipt = receiptService.getByRecordTreatmentId(recordTreatmentId);
        RecordTreatmentResponseDTO treatment = recordTreatmentService.getById(recordTreatmentId);
        List<RecordTreatmentMedicineResponseDTO> lines =
                recordTreatmentMedicineService.getByRecordTreatmentId(recordTreatmentId);

        if (lines.isEmpty()) {
            throw new ResourceNotFoundException("No dispensed medicine found for this receipt");
        }

        Map<String, Object> params = new HashMap<>();
        params.put("receiptId", receipt.getReceiptId());
        params.put("receiptDate", new SimpleDateFormat("dd/MM/yyyy HH:mm").format(receipt.getReceiptDate()));
        params.put("paymentStatus", receipt.getPaymentStatus());
        params.put("paymentMethod", receipt.getPaymentMethod());
        params.put("totalPrice", receipt.getTotalPrice());
        params.put("patientFullname", treatment.getPatientFullname());
        params.put("doctorFullname", treatment.getDoctorFullname());

        byte[] pdf = reportService.generatePdf("receipt", params, lines);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "receipt-" + receipt.getReceiptId() + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}