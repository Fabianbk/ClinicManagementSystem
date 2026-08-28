package com.clinic.clinicmanagementsystem.converter;

import com.clinic.clinicmanagementsystem.enums.Gender;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GenderConverter implements AttributeConverter<Gender, String> {

    @Override
    public String convertToDatabaseColumn(Gender attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public Gender convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        String clean = dbData.trim().toUpperCase();
        try {
            return Gender.valueOf(clean);
        } catch (IllegalArgumentException e) {
            if (clean.startsWith("M") || clean.contains("ชาย")) {
                return Gender.MALE;
            }
            if (clean.startsWith("F") || clean.contains("หญิง")) {
                return Gender.FEMALE;
            }
            return null;
        }
    }
}
