package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "receipts")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int receiptId;

    @Column(name = "receipt_date", nullable = false)
    private Date receiptDate;

    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "medicine_total")
    private Double medicineTotal;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "receipt_items",
            joinColumns = @JoinColumn(name = "receipt_id")
    )
    private List<ReceiptItem> additionalItems = new ArrayList<>();

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(name = "note", length = 255)
    private String note;

    @OneToOne
    @JoinColumn(name = "record_treatment_id", nullable = false, unique = true)
    private RecordTreatment recordTreatment;
}
