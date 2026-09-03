package com.clinic.clinicmanagementsystem.dto;

import com.clinic.clinicmanagementsystem.enums.SymptomCause;
import com.clinic.clinicmanagementsystem.enums.TreatmentProgramType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Set;

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

    @Size(max = 65535)
    private String presentHistory;

    @Size(max = 65535)
    private String personalHistory;


    private Double temp;
    private Integer pulse;
    private Integer respirationRate;

    @Size(max = 255)
    private String bp;

    private Integer height;
    private Double weight;
    private Double bmi;

    @Size(max = 20)
    private String bicepRt;

    @Size(max = 20)
    private String bicepLt;

    @Size(max = 20)
    private String tricepsRt;

    @Size(max = 20)
    private String tricepsLt;

    @Size(max = 20)
    private String kneeRt;

    @Size(max = 20)
    private String kneeLt;

    @Size(max = 20)
    private String ankleRt;

    @Size(max = 20)
    private String ankleLt;

    private Set<SymptomCause> causesOfSymptoms;

    @Size(max = 65535)
    private String causeOfSymptomsOther;

    @Size(max = 65535)
    private String summaryOfSickness;

    @Size(max = 65535)
    private String diagnosisElements;

    @Size(max = 65535)
    private String ttmDiagnosis;

    @Size(max = 65535)
    private String modernDiagnosis;

    @Size(max = 65535)
    private String additionalSymptoms;

    @Size(max = 65535)
    private String treatmentPlan;

    private Set<TreatmentProgramType> treatmentPrograms;

    @Size(max = 65535)
    private String treatmentProgramMassageDetails;

    @Size(max = 65535)
    private String treatmentProgramOther;

    @Size(max = 65535)
    private String treatmentProgram;

    @Size(max = 65535)
    private String evalAfterTreatment;

    @Size(max = 65535)
    private String suggestions;

    @Size(max = 65535)
    private String followup;

    private Integer painScoreBefore;
    private Integer painScoreAfter;

    private PrincipleRequestDTO principle;
    private HealthProfileRequestDTO healthProfile;
}
