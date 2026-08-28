package com.clinic.clinicmanagementsystem.converter;

import com.clinic.clinicmanagementsystem.enums.IdType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class IdTypeConverter implements AttributeConverter<IdType, String> {

    @Override
    public String convertToDatabaseColumn(IdType attribute) {
        return attribute != null ? attribute.name() : IdType.THAI_ID.name();
    }

    @Override
    public IdType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return IdType.THAI_ID;
        }
        String clean = dbData.trim().toUpperCase();
        try {
            return IdType.valueOf(clean);
        } catch (IllegalArgumentException e) {
            if (clean.contains("PASSPORT")) return IdType.PASSPORT;
            return IdType.THAI_ID;
        }
    }
}
