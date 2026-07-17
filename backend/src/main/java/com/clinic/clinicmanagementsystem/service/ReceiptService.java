package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.ReceiptRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ReceiptResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Receipt;
import com.clinic.clinicmanagementsystem.entity.RecordTreatment;
import com.clinic.clinicmanagementsystem.entity.RecordTreatmentMedicine;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.ReceiptMapper;
import com.clinic.clinicmanagementsystem.repository.ReceiptRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentMedicineRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final RecordTreatmentRepository recordTreatmentRepository;
    private final RecordTreatmentMedicineRepository recordTreatmentMedicineRepository;
    private final ReceiptMapper receiptMapper;

    /**
     * Calculate Treatment Fee + issue Receipt One
     * Receipt per RecordTreatment (unique FK), enforced explicitly for a
     * clean 400 instead of a raw constraint violation.
     */
    public ReceiptResponseDTO issue(ReceiptRequestDTO dto) {
        RecordTreatment recordTreatment = recordTreatmentRepository.findById(dto.getRecordTreatmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RecordTreatment", dto.getRecordTreatmentId()));

        if (receiptRepository.findByRecordTreatment_RecordTreatmentId(dto.getRecordTreatmentId()).isPresent()) {
            throw new BadRequestException("A receipt has already been issued for this treatment");
        }

        double totalPrice = recordTreatmentMedicineRepository
                .findByRecordTreatment_RecordTreatmentId(dto.getRecordTreatmentId()).stream()
                .mapToDouble(RecordTreatmentMedicine::getSubTotal)
                .sum();

        Receipt receipt = receiptMapper.toEntity(dto);
        receipt.setRecordTreatment(recordTreatment);
        receipt.setTotalPrice(totalPrice);

        return receiptMapper.toResponseDTO(receiptRepository.save(receipt));
    }

    @Transactional(readOnly = true)
    public ReceiptResponseDTO getById(int receiptId) {
        return receiptRepository.findById(receiptId)
                .map(receiptMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt", receiptId));
    }

    @Transactional(readOnly = true)
    public ReceiptResponseDTO getByRecordTreatmentId(int recordTreatmentId) {
        return receiptRepository.findByRecordTreatment_RecordTreatmentId(recordTreatmentId)
                .map(receiptMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Receipt for record treatment", recordTreatmentId));
    }
}