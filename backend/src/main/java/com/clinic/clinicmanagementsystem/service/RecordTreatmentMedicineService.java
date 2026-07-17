package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Medicine;
import com.clinic.clinicmanagementsystem.entity.RecordTreatment;
import com.clinic.clinicmanagementsystem.entity.RecordTreatmentMedicine;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.RecordTreatmentMedicineMapper;
import com.clinic.clinicmanagementsystem.repository.MedicineRepository;
import com.clinic.clinicmanagementsystem.repository.ReceiptRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentMedicineRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RecordTreatmentMedicineService {

    private final RecordTreatmentMedicineRepository recordTreatmentMedicineRepository;
    private final RecordTreatmentRepository recordTreatmentRepository;
    private final MedicineRepository medicineRepository;
    private final ReceiptRepository receiptRepository;
    private final RecordTreatmentMedicineMapper recordTreatmentMedicineMapper;

    /**
     * Dispenses a medicine against a RecordTreatment. priceAtTime and
     * subTotal are always computed here from Medicine.unitPrice — never
     * accepted from the client — so a tampered subtotal can never reach a
     * Receipt. Stock is decremented atomically in the same transaction.
     */
    public RecordTreatmentMedicineResponseDTO add(RecordTreatmentMedicineRequestDTO dto) {
        RecordTreatment recordTreatment = recordTreatmentRepository.findById(dto.getRecordTreatmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RecordTreatment", dto.getRecordTreatmentId()));

        if (receiptRepository.findByRecordTreatment_RecordTreatmentId(dto.getRecordTreatmentId()).isPresent()) {
            throw new BadRequestException(
                    "Cannot add medicine — a receipt has already been issued for this treatment");
        }

        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", dto.getMedicineId()));

        if (medicine.getStockRemaining() != null && medicine.getStockRemaining() < dto.getQuantity()) {
            throw new BadRequestException(
                    "Not enough stock for '" + medicine.getMedicineName() + "' (remaining: "
                            + medicine.getStockRemaining() + ", requested: " + dto.getQuantity() + ")");
        }

        double priceAtTime = medicine.getUnitPrice();
        double subTotal = priceAtTime * dto.getQuantity();

        RecordTreatmentMedicine entity = recordTreatmentMedicineMapper.toEntity(dto);
        entity.setRecordTreatment(recordTreatment);
        entity.setMedicine(medicine);
        entity.setPriceAtTime(priceAtTime);
        entity.setSubTotal(subTotal);

        if (medicine.getStockRemaining() != null) {
            medicine.setStockRemaining(medicine.getStockRemaining() - dto.getQuantity());
        }
        medicine.setStockIssued(
                (medicine.getStockIssued() == null ? 0 : medicine.getStockIssued()) + dto.getQuantity());
        medicineRepository.save(medicine);

        return recordTreatmentMedicineMapper.toResponseDTO(
                recordTreatmentMedicineRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<RecordTreatmentMedicineResponseDTO> getByRecordTreatmentId(int recordTreatmentId) {
        if (!recordTreatmentRepository.existsById(recordTreatmentId)) {
            throw new ResourceNotFoundException("RecordTreatment", recordTreatmentId);
        }
        return recordTreatmentMedicineRepository
                .findByRecordTreatment_RecordTreatmentId(recordTreatmentId).stream()
                .map(recordTreatmentMedicineMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Removes a dispensed-medicine line and restores stock. Blocked once a
     * Receipt exists for the treatment — the fee has already been
     * calculated and printed against the current line items.
     */
    public void remove(int recordTreatmentMedicineId) {
        RecordTreatmentMedicine entity = recordTreatmentMedicineRepository.findById(recordTreatmentMedicineId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RecordTreatmentMedicine", recordTreatmentMedicineId));

        int recordTreatmentId = entity.getRecordTreatment().getRecordTreatmentId();
        if (receiptRepository.findByRecordTreatment_RecordTreatmentId(recordTreatmentId).isPresent()) {
            throw new BadRequestException(
                    "Cannot remove medicine — a receipt has already been issued for this treatment");
        }

        Medicine medicine = entity.getMedicine();
        if (medicine.getStockRemaining() != null) {
            medicine.setStockRemaining(medicine.getStockRemaining() + entity.getQuantity());
        }
        if (medicine.getStockIssued() != null) {
            medicine.setStockIssued(medicine.getStockIssued() - entity.getQuantity());
        }
        medicineRepository.save(medicine);

        recordTreatmentMedicineRepository.delete(entity);
    }
}