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
@Table(name = "principles")
public class Principle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int principleId;

    @Column(name = "principle_dhatu", length = 255)
    private String principleDhatu;

    @Column(name = "secondary_dhatu", length = 255)
    private String secondaryDhatu;

    @Column(name = "elementary_principles", length = 255)
    private String elementaryPrinciples;

    @Column(name = "seasonal_principles", length = 255)
    private String seasonalPrinciples;

    @Column(name = "age_principles", length = 255)
    private String agePrinciples;

    @Column(name = "time_principles", length = 255)
    private String timePrinciples;

    @Column(name = "geographic_principles", length = 255)
    private String geographicPrinciples;
}
