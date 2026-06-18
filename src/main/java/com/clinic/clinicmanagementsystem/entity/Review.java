package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int reviewId;

    @Column(name = "rating_clinic_score", nullable = false)
    private Integer ratingClinicScore;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "review_date", nullable = false)
    private Date reviewDate;

    @OneToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
}
