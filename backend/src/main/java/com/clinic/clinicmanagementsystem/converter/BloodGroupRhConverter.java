package com.clinic.clinicmanagementsystem.converter;

import com.clinic.clinicmanagementsystem.enums.BloodGroupRh;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BloodGroupRhConverter implements AttributeConverter<BloodGroupRh, String> {

    @Override
    public String convertToDatabaseColumn(BloodGroupRh attribute) {
        return attribute != null ? attribute.name() : BloodGroupRh.UNKNOWN.name();
    }

    @Override
    public BloodGroupRh convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return BloodGroupRh.UNKNOWN;
        }
        String clean = dbData.trim().toUpperCase();
        try {
            return BloodGroupRh.valueOf(clean);
        } catch (IllegalArgumentException e) {
            if (clean.contains("+") || clean.contains("POS")) return BloodGroupRh.POSITIVE;
            if (clean.contains("-") || clean.contains("NEG")) return BloodGroupRh.NEGATIVE;
            return BloodGroupRh.UNKNOWN;
        }
    }
}
