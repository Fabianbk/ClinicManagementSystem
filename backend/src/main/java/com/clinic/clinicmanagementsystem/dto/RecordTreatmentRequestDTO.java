package com.clinic.clinicmanagementsystem.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordTreatmentRequestDTO {

    private Integer appointmentId;

    private Integer patientId;

    @NotNull(message = "Doctor ID is required")
    private Integer doctorId;

    @NotNull(message = "Record date is required")
    private Date recordDate;

    @Size(max = 65535)
    private String symptoms;

    private Double temp;
    private Integer pulse;
    private Integer respirationRate;

    @Size(max = 255)
    private String bp;

    private Integer height;
    private Double weight;
    private Double bmi;

    @Size(max = 65535)
    private String causeOfSymptoms;

    @Size(max = 65535)
    private String summaryOfSickness;

    @Size(max = 65535)
    private String diagnosisElements;

    @Size(max = 65535)
    private String ttmDiagnosis;

    @Size(max = 65535)
    private String modernDiagnosis;

    @Size(max = 65535)
    private String treatmentPlan;

    @Size(max = 65535)
    private String treatmentProgram;

    @Size(max = 65535)
    private String suggestions;

    @Size(max = 65535)
    private String followup;

    private Integer painScoreBefore;
    private Integer painScoreAfter;

    private PrincipleRequestDTO principle;
    private HealthProfileRequestDTO healthProfile;
}
