package com.clinic.clinicmanagementsystem.converter;

import com.clinic.clinicmanagementsystem.enums.TreatmentRights;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TreatmentRightsConverter implements AttributeConverter<TreatmentRights, String> {

    @Override
    public String convertToDatabaseColumn(TreatmentRights attribute) {
        return attribute != null ? attribute.name() : TreatmentRights.PAY_DIRECT.name();
    }

    @Override
    public TreatmentRights convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return TreatmentRights.PAY_DIRECT;
        }
        String clean = dbData.trim().toUpperCase();
        try {
            return TreatmentRights.valueOf(clean);
        } catch (IllegalArgumentException e) {
            if (clean.contains("ELDER") || clean.contains("สูงอายุ")) return TreatmentRights.ELDERLY;
            if (clean.contains("MONK") || clean.contains("บวช")) return TreatmentRights.MONK;
            if (clean.contains("DISAB") || clean.contains("พิการ")) return TreatmentRights.DISABLED;
            if (clean.contains("OTHER") || clean.contains("อื่น")) return TreatmentRights.OTHER;
            return TreatmentRights.PAY_DIRECT;
        }
    }
}
