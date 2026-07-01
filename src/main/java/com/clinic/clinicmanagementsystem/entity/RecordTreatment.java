package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "record_treatments")
public class RecordTreatment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int recordTreatmentId;

    @Column(name = "record_date", nullable = false)
    private Date recordDate;

    @Column(name = "symptoms", length = 1000)
    private String symptoms;

    @Column(name = "temp")
    private Double temp;

    @Column(name = "pulse")
    private Integer pulse;

    @Column(name = "respiration_rate")
    private Integer respirationRate;

    @Column(name = "bp", length = 20)
    private String bp;

    @Column(name = "height")
    private Integer height;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "bmi")
    private Double bmi;

    @Column(name = "cause_of_symptoms", length = 1000)
    private String causeOfSymptoms;

    @Column(name = "summary_of_sickness", length = 1000)
    private String summaryOfSickness;

    @Column(name = "diagnosis_elements", length = 1000)
    private String diagnosisElements;

    @Column(name = "ttm_diagnosis", length = 1000)
    private String ttmDiagnosis;

    @Column(name = "modern_diagnosis", length = 1000)
    private String modernDiagnosis;

    @Column(name = "treatment_plan", length = 1000)
    private String treatmentPlan;

    @Column(name = "treatment_program", length = 1000)
    private String treatmentProgram;

    @Column(name = "suggestions", length = 1000)
    private String suggestions;

    @Column(name = "followup", length = 255)
    private String followup;

    @Column(name = "pain_score_before")
    private Integer painScoreBefore;

    @Column(name = "pain_score_after")
    private Integer painScoreAfter;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false,unique = true)
    private Appointment appointment;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "recordTreatment")
    private List<RecordTreatmentMedicine> recordTreatmentMedicines;

    @OneToOne(mappedBy = "recordTreatment", cascade = CascadeType.ALL)
    private Receipt receipt;
}
