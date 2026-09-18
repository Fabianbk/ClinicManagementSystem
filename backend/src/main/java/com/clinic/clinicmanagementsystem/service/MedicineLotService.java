package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.MedicineLotRequestDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineLotResponseDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineResponseDTO;
import com.clinic.clinicmanagementsystem.dto.StockAdjustmentRequestDTO;
import com.clinic.clinicmanagementsystem.entity.Medicine;
import com.clinic.clinicmanagementsystem.entity.MedicineLot;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.MedicineLotMapper;
import com.clinic.clinicmanagementsystem.mapper.MedicineMapper;
import com.clinic.clinicmanagementsystem.repository.MedicineLotRepository;
import com.clinic.clinicmanagementsystem.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicineLotService {

    private final MedicineLotRepository medicineLotRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineLotMapper medicineLotMapper;
    private final MedicineMapper medicineMapper;

    /**
     * Receives new stock into a new lot. Increments medicine's stockRemaining and stockReceived.
     */
    public MedicineLotResponseDTO receiveStock(MedicineLotRequestDTO dto) {
        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", dto.getMedicineId()));

        if (medicineLotRepository.existsByMedicine_MedicineIdAndLotNumberIgnoreCase(
                dto.getMedicineId(), dto.getLotNumber().trim())) {
            throw new DuplicateResourceException(
                    "Lot number '" + dto.getLotNumber() + "' already exists for medicine '" + medicine.getMedicineName() + "'");
        }

        if (dto.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Expiry date cannot be in the past");
        }

        if (dto.getReceivedDate() == null) {
            dto.setReceivedDate(LocalDate.now());
        }

        MedicineLot lot = medicineLotMapper.toEntity(dto);
        lot.setMedicine(medicine);
        lot.setLotNumber(dto.getLotNumber().trim());
        lot.setQuantityRemaining(dto.getQuantityReceived());
        lot.setStatus("ACTIVE");

        MedicineLot savedLot = medicineLotRepository.save(lot);

        // Update medicine stock aggregates
        int currentRemaining = medicine.getStockRemaining() == null ? 0 : medicine.getStockRemaining();
        int currentReceived = medicine.getStockReceived() == null ? 0 : medicine.getStockReceived();
        medicine.setStockRemaining(currentRemaining + dto.getQuantityReceived());
        medicine.setStockReceived(currentReceived + dto.getQuantityReceived());
        medicineRepository.save(medicine);

        return medicineLotMapper.toResponseDTO(savedLot);
    }

    /**
     * Adjusts stock quantity for audit, damage, or expiration write-offs.
     */
    public MedicineResponseDTO adjustStock(StockAdjustmentRequestDTO dto) {
        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", dto.getMedicineId()));

        if (dto.getLotId() != null) {
            MedicineLot lot = medicineLotRepository.findById(dto.getLotId())
                    .orElseThrow(() -> new ResourceNotFoundException("MedicineLot", dto.getLotId()));

            if (lot.getMedicine().getMedicineId() != medicine.getMedicineId()) {
                throw new BadRequestException("Lot does not belong to the specified medicine");
            }

            int oldLotRemaining = lot.getQuantityRemaining();
            int diff = dto.getNewQuantityRemaining() - oldLotRemaining;

            lot.setQuantityRemaining(dto.getNewQuantityRemaining());
            if (dto.getNewQuantityRemaining() == 0) {
                lot.setStatus("EXPIRED_WRITEOFF".equalsIgnoreCase(dto.getReason()) ? "EXPIRED" : "DEPLETED");
            } else if (lot.getExpiryDate().isBefore(LocalDate.now())) {
                lot.setStatus("EXPIRED");
            } else {
                lot.setStatus("ACTIVE");
            }

            if (dto.getNote() != null && !dto.getNote().isBlank()) {
                lot.setNote((lot.getNote() == null ? "" : lot.getNote() + " | ") +
                        "Adj [" + dto.getReason() + "]: " + dto.getNote());
            }
            medicineLotRepository.save(lot);

            int currentRemaining = medicine.getStockRemaining() == null ? 0 : medicine.getStockRemaining();
            int newTotal = Math.max(0, currentRemaining + diff);
            medicine.setStockRemaining(newTotal);
            medicineRepository.save(medicine);
        } else {
            // Direct adjustment on medicine
            medicine.setStockRemaining(dto.getNewQuantityRemaining());
            medicineRepository.save(medicine);
        }

        return enrichMedicineDTO(medicineMapper.toResponseDTO(medicine), medicine.getMedicineId());
    }

    @Transactional(readOnly = true)
    public List<MedicineLotResponseDTO> getLotsByMedicineId(int medicineId) {
        if (!medicineRepository.existsById(medicineId)) {
            throw new ResourceNotFoundException("Medicine", medicineId);
        }
        return medicineLotRepository.findByMedicine_MedicineIdOrderByExpiryDateAsc(medicineId).stream()
                .map(medicineLotMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicineLotResponseDTO> getExpiringLots(int days) {
        LocalDate today = LocalDate.now();
        LocalDate target = today.plusDays(days > 0 ? days : 60);

        List<MedicineLot> expiringSoon = medicineLotRepository.findExpiringSoonLots(today, target);
        List<MedicineLot> expired = medicineLotRepository.findExpiredLots(today);

        // Combine
        expiringSoon.addAll(expired);
        return expiringSoon.stream()
                .distinct()
                .map(medicineLotMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public void deleteLot(int lotId) {
        MedicineLot lot = medicineLotRepository.findById(lotId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicineLot", lotId));

        if (lot.getRecordTreatmentMedicines() != null && !lot.getRecordTreatmentMedicines().isEmpty()) {
            throw new BadRequestException("Cannot delete lot — medicines from this lot have already been dispensed in treatment records");
        }

        Medicine medicine = lot.getMedicine();
        int remaining = lot.getQuantityRemaining();
        int received = lot.getQuantityReceived();

        if (medicine.getStockRemaining() != null) {
            medicine.setStockRemaining(Math.max(0, medicine.getStockRemaining() - remaining));
        }
        if (medicine.getStockReceived() != null) {
            medicine.setStockReceived(Math.max(0, medicine.getStockReceived() - received));
        }
        medicineRepository.save(medicine);

        medicineLotRepository.delete(lot);
    }

    /**
     * Enriches a MedicineResponseDTO with active lots, earliest expiry, and warning flags.
     */
    public MedicineResponseDTO enrichMedicineDTO(MedicineResponseDTO dto, int medicineId) {
        List<MedicineLot> lots = medicineLotRepository.findByMedicine_MedicineIdOrderByExpiryDateAsc(medicineId);
        LocalDate today = LocalDate.now();
        LocalDate soonThreshold = today.plusDays(60);

        List<MedicineLot> activeLots = lots.stream()
                .filter(l -> l.getQuantityRemaining() != null && l.getQuantityRemaining() > 0)
                .collect(Collectors.toList());

        dto.setActiveLotCount(activeLots.size());

        LocalDate earliest = null;
        boolean hasExpiringSoon = false;
        boolean hasExpired = false;

        for (MedicineLot l : activeLots) {
            if (earliest == null || l.getExpiryDate().isBefore(earliest)) {
                earliest = l.getExpiryDate();
            }
            if (l.getExpiryDate().isBefore(today)) {
                hasExpired = true;
            } else if (l.getExpiryDate().isBefore(soonThreshold)) {
                hasExpiringSoon = true;
            }
        }

        dto.setEarliestExpiryDate(earliest);
        dto.setHasExpiringSoon(hasExpiringSoon);
        dto.setHasExpired(hasExpired);
        dto.setLots(lots.stream().map(medicineLotMapper::toResponseDTO).collect(Collectors.toList()));

        return dto;
    }
}
