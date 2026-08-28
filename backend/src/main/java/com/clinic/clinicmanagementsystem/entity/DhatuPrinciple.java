package com.clinic.clinicmanagementsystem.entity;

import com.clinic.clinicmanagementsystem.enums.AgePrinciple;
import com.clinic.clinicmanagementsystem.enums.Dhatu;
import com.clinic.clinicmanagementsystem.enums.TriDosha;
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
@Table(name = "dhatu_principles")
public class DhatuPrinciple {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "principle_id")
    private int principleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "principal_dhatu", length = 50)
    private Dhatu principalDhatu;

    @Enumerated(EnumType.STRING)
    @Column(name = "secondary_dhatu", length = 50)
    private Dhatu secondaryDhatu;

    @Enumerated(EnumType.STRING)
    @Column(name = "conception_dhatu", length = 50)
    private Dhatu conceptionDhatu;

    @Enumerated(EnumType.STRING)
    @Column(name = "conception_characteristic", length = 50)
    private TriDosha conceptionCharacteristic;

    @Enumerated(EnumType.STRING)
    @Column(name = "seasonal_onset", length = 50)
    private TriDosha seasonalOnset;

    @Enumerated(EnumType.STRING)
    @Column(name = "seasonal_current", length = 50)
    private TriDosha seasonalCurrent;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_onset", length = 50)
    private TriDosha timeOnset;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_current", length = 50)
    private TriDosha timeCurrent;

    @Enumerated(EnumType.STRING)
    @Column(name = "geo_birthplace", length = 50)
    private Dhatu geoBirthplace;

    @Enumerated(EnumType.STRING)
    @Column(name = "geo_current", length = 50)
    private Dhatu geoCurrent;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_principle", length = 50)
    private AgePrinciple agePrinciple;
}
