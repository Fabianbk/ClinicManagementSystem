package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.ReceiptRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ReceiptResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Receipt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReceiptMapper {

    @Mapping(target = "receiptId", ignore = true)
    @Mapping(target = "recordTreatment", ignore = true)
    Receipt toEntity(ReceiptRequestDTO dto);

    @Mapping(target = "recordTreatmentId", source = "recordTreatment.recordTreatmentId")
    ReceiptResponseDTO toResponseDTO(Receipt entity);
}
