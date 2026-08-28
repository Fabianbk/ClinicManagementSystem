package com.clinic.clinicmanagementsystem.converter;

import com.clinic.clinicmanagementsystem.enums.HouseholdStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class HouseholdStatusConverter implements AttributeConverter<HouseholdStatus, String> {

    @Override
    public String convertToDatabaseColumn(HouseholdStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public HouseholdStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        String clean = dbData.trim().toUpperCase();
        try {
            return HouseholdStatus.valueOf(clean);
        } catch (IllegalArgumentException e) {
            if (clean.contains("HEAD") || clean.contains("เจ้าบ้าน")) return HouseholdStatus.HEAD_OF_HOUSEHOLD;
            if (clean.contains("RESIDENT") || clean.contains("ผู้อาศัย")) return HouseholdStatus.RESIDENT;
            return null;
        }
    }
}
