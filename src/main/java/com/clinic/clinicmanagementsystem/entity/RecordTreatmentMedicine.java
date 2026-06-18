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
@Table(name = "record_treatment_medicines")
public class RecordTreatmentMedicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int recordTreatmentMedicineId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price_at_time", nullable = false)
    private Double priceAtTime;

    @Column(name = "sub_total", nullable = false)
    private Double subTotal;

    @ManyToOne
    @JoinColumn(name = "record_treatment_id", nullable = false)
    private RecordTreatment recordTreatment;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;
}
