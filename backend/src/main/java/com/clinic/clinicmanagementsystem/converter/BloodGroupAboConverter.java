package com.clinic.clinicmanagementsystem.converter;

import com.clinic.clinicmanagementsystem.enums.BloodGroupAbo;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BloodGroupAboConverter implements AttributeConverter<BloodGroupAbo, String> {

    @Override
    public String convertToDatabaseColumn(BloodGroupAbo attribute) {
        return attribute != null ? attribute.name() : BloodGroupAbo.UNKNOWN.name();
    }

    @Override
    public BloodGroupAbo convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return BloodGroupAbo.UNKNOWN;
        }
        String clean = dbData.trim().toUpperCase().replaceAll("[+-]", "");
        try {
            return BloodGroupAbo.valueOf(clean);
        } catch (IllegalArgumentException e) {
            if (clean.contains("AB")) return BloodGroupAbo.AB;
            if (clean.contains("A")) return BloodGroupAbo.A;
            if (clean.contains("B")) return BloodGroupAbo.B;
            if (clean.contains("O")) return BloodGroupAbo.O;
            return BloodGroupAbo.UNKNOWN;
        }
    }
}
