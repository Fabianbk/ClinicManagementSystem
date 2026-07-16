package com.clinic.clinicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordTreatmentResponseDTO {
    private int recordTreatmentId;
    private Date recordDate;
    private String symptoms;
    private Double temp;
    private Integer pulse;
    private Integer respirationRate;
    private String bp;
    private Integer height;
    private Double weight;
    private Double bmi;
    private String causeOfSymptoms;
    private String summaryOfSickness;
    private String diagnosisElements;
    private String ttmDiagnosis;
    private String modernDiagnosis;
    private String treatmentPlan;
    private String treatmentProgram;
    private String suggestions;
    private String followup;
    private Integer painScoreBefore;
    private Integer painScoreAfter;

    private int doctorId;
    private String doctorFullname;

    private int appointmentId;
    private int patientId;
    private String patientFullname;

    private List<RecordTreatmentMedicineResponseDTO> recordTreatmentMedicines;

    /** Null until a receipt has actually been issued for this treatment. */
    private ReceiptResponseDTO receipt;
}
