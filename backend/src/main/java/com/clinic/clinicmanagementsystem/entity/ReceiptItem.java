package com.clinic.clinicmanagementsystem.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptItem {

    @Column(name = "item_name", nullable = false, length = 255)
    private String itemName;

    @Column(name = "amount", nullable = false)
    private Double amount;
}
