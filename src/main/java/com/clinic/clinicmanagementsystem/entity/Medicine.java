package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medicines")
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int medicineId;

    @Column(name = "medicine_name", nullable = false, length = 255)
    private String medicineName;

    @Column(name = "medicine_category", length = 100)
    private String medicineCategory;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "unit_type", length = 50)
    private String unitType;

    @Column(name = "stock_remaining")
    private Integer stockRemaining;

    @Column(name = "stock_brought_forward")
    private Integer stockBroughtForward;

    @Column(name = "stock_received")
    private Integer stockReceived;

    @Column(name = "stock_issued")
    private Integer stockIssued;

    @Column(name = "note", length = 255)
    private String note;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, mappedBy = "medicine")
    private List<RecordTreatmentMedicine> recordTreatmentMedicines;
}
