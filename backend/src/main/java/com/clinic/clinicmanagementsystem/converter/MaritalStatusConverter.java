package com.clinic.clinicmanagementsystem.converter;

import com.clinic.clinicmanagementsystem.enums.MaritalStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class MaritalStatusConverter implements AttributeConverter<MaritalStatus, String> {

    @Override
    public String convertToDatabaseColumn(MaritalStatus attribute) {
        return attribute != null ? attribute.name() : null;
    }

    @Override
    public MaritalStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        String clean = dbData.trim().toUpperCase().replace(" ", "_");
        try {
            return MaritalStatus.valueOf(clean);
        } catch (IllegalArgumentException e) {
            if (clean.contains("SINGLE") || clean.contains("โสด")) return MaritalStatus.SINGLE;
            if (clean.contains("MARRIED") || clean.contains("สมรส")) return MaritalStatus.MARRIED;
            if (clean.contains("WIDOW") || clean.contains("หม้าย")) return MaritalStatus.WIDOWED;
            if (clean.contains("DIVORCE") || clean.contains("หย่า")) return MaritalStatus.DIVORCED;
            if (clean.contains("SEPARAT") || clean.contains("แยก")) return MaritalStatus.SEPARATED;
            if (clean.contains("RELATION") || clean.contains("คู่")) return MaritalStatus.IN_RELATIONSHIP;
            if (clean.contains("MONK") || clean.contains("บวช") || clean.contains("สมณะ")) return MaritalStatus.MONK;
            return MaritalStatus.SINGLE;
        }
    }
}
