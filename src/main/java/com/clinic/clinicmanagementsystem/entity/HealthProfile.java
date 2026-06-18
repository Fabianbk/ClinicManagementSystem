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

    @Column(name = "present_history", length = 1000)
    private String presentHistory;

    @Column(name = "underlying_disease", length = 1000)
    private String underlyingDisease;

    @Column(name = "hereditary_disease", length = 1000)
    private String hereditaryDisease;

    @Column(name = "drug_allergy", length = 1000)
    private String drugAllergy;

    @Column(name = "food_allergy", length = 1000)
    private String foodAllergy;

    @Column(name = "accident_history", length = 1000)
    private String accidentHistory;

    @Column(name = "personal_history", length = 1000)
    private String personalHistory;

    @Column(name = "alcohol_consumption", length = 255)
    private String alcoholConsumption;

    @Column(name = "smoking_history", length = 255)
    private String smokingHistory;

    @Column(name = "menstruation", length = 255)
    private String menstruation;
}
