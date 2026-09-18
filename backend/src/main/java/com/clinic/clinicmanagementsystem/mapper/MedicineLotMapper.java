package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.MedicineLotRequestDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineLotResponseDTO;
import com.clinic.clinicmanagementsystem.entity.MedicineLot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Mapper(componentModel = "spring")
public interface MedicineLotMapper {

    @Mapping(target = "lotId", ignore = true)
    @Mapping(target = "medicine", ignore = true)
    @Mapping(target = "quantityRemaining", source = "quantityReceived")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "recordTreatmentMedicines", ignore = true)
    MedicineLot toEntity(MedicineLotRequestDTO dto);

    @Mapping(target = "medicineId", source = "medicine.medicineId")
    @Mapping(target = "medicineName", source = "medicine.medicineName")
    @Mapping(target = "unitType", source = "medicine.unitType")
    @Mapping(target = "daysUntilExpiry", expression = "java(computeDaysUntilExpiry(entity.getExpiryDate()))")
    @Mapping(target = "expired", expression = "java(isExpired(entity.getExpiryDate()))")
    @Mapping(target = "expiringSoon", expression = "java(isExpiringSoon(entity.getExpiryDate()))")
    MedicineLotResponseDTO toResponseDTO(MedicineLot entity);

    default long computeDaysUntilExpiry(LocalDate expiryDate) {
        if (expiryDate == null) return 0;
        return ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    default boolean isExpired(LocalDate expiryDate) {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDate.now());
    }

    default boolean isExpiringSoon(LocalDate expiryDate) {
        if (expiryDate == null) return false;
        LocalDate now = LocalDate.now();
        return !expiryDate.isBefore(now) && expiryDate.isBefore(now.plusDays(60));
    }
}
