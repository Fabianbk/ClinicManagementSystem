package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Medicine;
import com.clinic.clinicmanagementsystem.entity.MedicineLot;
import com.clinic.clinicmanagementsystem.entity.RecordTreatment;
import com.clinic.clinicmanagementsystem.entity.RecordTreatmentMedicine;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.RecordTreatmentMedicineMapper;
import com.clinic.clinicmanagementsystem.repository.MedicineLotRepository;
import com.clinic.clinicmanagementsystem.repository.MedicineRepository;
import com.clinic.clinicmanagementsystem.repository.ReceiptRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentMedicineRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RecordTreatmentMedicineService {

    private final RecordTreatmentMedicineRepository recordTreatmentMedicineRepository;
    private final RecordTreatmentRepository recordTreatmentRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineLotRepository medicineLotRepository;
    private final ReceiptRepository receiptRepository;
    private final RecordTreatmentMedicineMapper recordTreatmentMedicineMapper;

    /**
     * Dispenses a medicine against a RecordTreatment. Uses FIFO (Earliest Expiry First)
     * across active, non-expired lots. If quantity spans multiple lots, splits into
     * multiple records for exact lot traceability. Blocks expired medicines completely.
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

        LocalDate today = LocalDate.now();

        // 1. Check all active lots for this medicine ordered by expiry date ASC
        List<MedicineLot> allLots = medicineLotRepository
                .findByMedicine_MedicineIdOrderByExpiryDateAsc(medicine.getMedicineId());

        List<MedicineLot> validLots = new ArrayList<>();
        int totalValidRemaining = 0;

        for (MedicineLot lot : allLots) {
            if (lot.getQuantityRemaining() != null && lot.getQuantityRemaining() > 0) {
                if (lot.getExpiryDate().isBefore(today)) {
                    // Automatically mark expired
                    lot.setStatus("EXPIRED");
                    medicineLotRepository.save(lot);
                } else {
                    validLots.add(lot);
                    totalValidRemaining += lot.getQuantityRemaining();
                }
            }
        }

        // If lots exist in the system for this medicine, strictly validate against valid non-expired lots
        if (!allLots.isEmpty()) {
            if (totalValidRemaining < dto.getQuantity()) {
                throw new BadRequestException(
                        "Not enough valid non-expired stock for '" + medicine.getMedicineName() +
                                "' (valid remaining: " + totalValidRemaining + ", requested: " + dto.getQuantity() + ")");
            }
        } else {
            // Legacy / no-lot fallback
            if (medicine.getStockRemaining() != null && medicine.getStockRemaining() < dto.getQuantity()) {
                throw new BadRequestException(
                        "Not enough stock for '" + medicine.getMedicineName() + "' (remaining: "
                                + medicine.getStockRemaining() + ", requested: " + dto.getQuantity() + ")");
            }
        }

        double unitPrice = medicine.getUnitPrice();
        int quantityToDeduct = dto.getQuantity();

        RecordTreatmentMedicine primarySavedEntity = null;

        if (!validLots.isEmpty()) {
            // FIFO deduction across valid lots
            for (MedicineLot lot : validLots) {
                if (quantityToDeduct <= 0) break;

                int takeFromThisLot = Math.min(lot.getQuantityRemaining(), quantityToDeduct);
                lot.setQuantityRemaining(lot.getQuantityRemaining() - takeFromThisLot);
                if (lot.getQuantityRemaining() == 0) {
                    lot.setStatus("DEPLETED");
                }
                medicineLotRepository.save(lot);

                RecordTreatmentMedicine lineEntity = new RecordTreatmentMedicine();
                lineEntity.setRecordTreatment(recordTreatment);
                lineEntity.setMedicine(medicine);
                lineEntity.setMedicineLot(lot);
                lineEntity.setQuantity(takeFromThisLot);
                lineEntity.setPriceAtTime(unitPrice);
                lineEntity.setSubTotal(unitPrice * takeFromThisLot);

                RecordTreatmentMedicine saved = recordTreatmentMedicineRepository.save(lineEntity);
                if (primarySavedEntity == null) {
                    primarySavedEntity = saved;
                }
                quantityToDeduct -= takeFromThisLot;
            }
        } else {
            // Fallback for medicine without lots
            RecordTreatmentMedicine lineEntity = new RecordTreatmentMedicine();
            lineEntity.setRecordTreatment(recordTreatment);
            lineEntity.setMedicine(medicine);
            lineEntity.setQuantity(dto.getQuantity());
            lineEntity.setPriceAtTime(unitPrice);
            lineEntity.setSubTotal(unitPrice * dto.getQuantity());
            primarySavedEntity = recordTreatmentMedicineRepository.save(lineEntity);
        }

        // Update overall medicine stock aggregates
        if (medicine.getStockRemaining() != null) {
            medicine.setStockRemaining(Math.max(0, medicine.getStockRemaining() - dto.getQuantity()));
        }
        medicine.setStockIssued(
                (medicine.getStockIssued() == null ? 0 : medicine.getStockIssued()) + dto.getQuantity());
        medicineRepository.save(medicine);

        return recordTreatmentMedicineMapper.toResponseDTO(primarySavedEntity);
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
     * Removes a dispensed-medicine line and restores stock to both the lot and the medicine.
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

        // Restore lot stock
        MedicineLot lot = entity.getMedicineLot();
        if (lot != null) {
            lot.setQuantityRemaining(lot.getQuantityRemaining() + entity.getQuantity());
            if (!lot.getExpiryDate().isBefore(LocalDate.now())) {
                lot.setStatus("ACTIVE");
            }
            medicineLotRepository.save(lot);
        }

        // Restore medicine aggregate stock
        Medicine medicine = entity.getMedicine();
        if (medicine.getStockRemaining() != null) {
            medicine.setStockRemaining(medicine.getStockRemaining() + entity.getQuantity());
        }
        if (medicine.getStockIssued() != null) {
            medicine.setStockIssued(Math.max(0, medicine.getStockIssued() - entity.getQuantity()));
        }
        medicineRepository.save(medicine);

        recordTreatmentMedicineRepository.delete(entity);
    }
}