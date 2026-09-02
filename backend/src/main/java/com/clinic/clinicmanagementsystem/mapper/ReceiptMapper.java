package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.ReceiptRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ReceiptResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Receipt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {RecordTreatmentMedicineMapper.class})
public interface ReceiptMapper {

    @Mapping(target = "receiptId", ignore = true)
    @Mapping(target = "recordTreatment", ignore = true)
    @Mapping(target = "medicineTotal", ignore = true) // computed server-side in ReceiptService
    @Mapping(target = "totalPrice", ignore = true) // computed server-side in ReceiptService
    Receipt toEntity(ReceiptRequestDTO dto);

    @Mapping(target = "recordTreatmentId", source = "recordTreatment.recordTreatmentId")
    @Mapping(target = "medicines", source = "recordTreatment.recordTreatmentMedicines")
    ReceiptResponseDTO toResponseDTO(Receipt entity);
}