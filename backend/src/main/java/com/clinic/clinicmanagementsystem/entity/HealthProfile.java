package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "health_profiles")
public class HealthProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int healthId;

    @Column(name = "present_history", columnDefinition = "TEXT")
    private String presentHistory;

    @Column(name = "underlying_disease", columnDefinition = "TEXT")
    private String underlyingDisease;

    @Column(name = "hereditary_disease", columnDefinition = "TEXT")
    private String hereditaryDisease;

    @Column(name = "drug_allergy", columnDefinition = "TEXT")
    private String drugAllergy;

    @Column(name = "food_allergy", columnDefinition = "TEXT")
    private String foodAllergy;

    @Column(name = "accident_history", columnDefinition = "TEXT")
    private String accidentHistory;

    @Column(name = "personal_history", columnDefinition = "TEXT")
    private String personalHistory;

    @Column(name = "alcohol_consumption", columnDefinition = "TEXT")
    private String alcoholConsumption;

    @Column(name = "smoking_history", columnDefinition = "TEXT")
    private String smokingHistory;

    @Column(name = "menstruation", columnDefinition = "TEXT")
    private String menstruation;
}
