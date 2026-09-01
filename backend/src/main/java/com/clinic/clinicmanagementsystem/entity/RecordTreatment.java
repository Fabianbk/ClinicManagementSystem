package com.clinic.clinicmanagementsystem.entity;

import com.clinic.clinicmanagementsystem.enums.SymptomCause;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "temp")
    private Double temp;

    @Column(name = "pulse")
    private Integer pulse;

    @Column(name = "respiration_rate")
    private Integer respirationRate;

    @Column(name = "bp", length = 255)
    private String bp;

    @Column(name = "height")
    private Integer height;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "bmi")
    private Double bmi;

    @ElementCollection(targetClass = SymptomCause.class, fetch = FetchType.EAGER)
    @CollectionTable(
            name = "record_treatment_causes",
            joinColumns = @JoinColumn(name = "record_treatment_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "cause", nullable = false, length = 50)
    private Set<SymptomCause> causesOfSymptoms = new HashSet<>();

    @Column(name = "cause_of_symptoms_other", columnDefinition = "TEXT")
    private String causeOfSymptomsOther;

    @Column(name = "summary_of_sickness", columnDefinition = "TEXT")
    private String summaryOfSickness;

    @Column(name = "diagnosis_elements", columnDefinition = "TEXT")
    private String diagnosisElements;

    @Column(name = "ttm_diagnosis", columnDefinition = "TEXT")
    private String ttmDiagnosis;

    @Column(name = "modern_diagnosis", columnDefinition = "TEXT")
    private String modernDiagnosis;

    @Column(name = "treatment_plan", columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(name = "treatment_program", columnDefinition = "TEXT")
    private String treatmentProgram;

    @Column(name = "suggestions", columnDefinition = "TEXT")
    private String suggestions;

    @Column(name = "followup", columnDefinition = "TEXT")
    private String followup;

    @Column(name = "pain_score_before")
    private Integer painScoreBefore;

    @Column(name = "pain_score_after")
    private Integer painScoreAfter;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "health_profile_health_id")
    private HealthProfile healthProfile;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "recordTreatment")
    private List<RecordTreatmentMedicine> recordTreatmentMedicines;

    @OneToOne(mappedBy = "recordTreatment", cascade = CascadeType.ALL)
    private Receipt receipt;

    public Patient getPatient() {
        return appointment != null ? appointment.getPatient() : null;
    }
}
