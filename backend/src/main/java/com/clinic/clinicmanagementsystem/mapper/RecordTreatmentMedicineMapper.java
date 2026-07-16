package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineResponseDTO;
import com.clinic.clinicmanagementsystem.entity.RecordTreatmentMedicine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RecordTreatmentMedicineMapper {

    @Mapping(target = "recordTreatmentMedicineId", ignore = true)
    @Mapping(target = "recordTreatment", ignore = true)
    @Mapping(target = "medicine", ignore = true)
    @Mapping(target = "priceAtTime", ignore = true) // service computes from Medicine.unitPrice at the time of treatment
    @Mapping(target = "subTotal", ignore = true)    // service computes as priceAtTime * quantity
    RecordTreatmentMedicine toEntity(RecordTreatmentMedicineRequestDTO dto);

    @Mapping(target = "medicineId", source = "medicine.medicineId")
    @Mapping(target = "medicineName", source = "medicine.medicineName")
    RecordTreatmentMedicineResponseDTO toResponseDTO(RecordTreatmentMedicine entity);
}
