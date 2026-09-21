package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentMedicineResponseDTO;
import com.clinic.clinicmanagementsystem.entity.*;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.mapper.RecordTreatmentMedicineMapper;
import com.clinic.clinicmanagementsystem.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecordTreatmentMedicineServiceTest {

    @Mock
    private RecordTreatmentMedicineRepository recordTreatmentMedicineRepository;

    @Mock
    private RecordTreatmentRepository recordTreatmentRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineLotRepository medicineLotRepository;

    @Mock
    private ReceiptRepository receiptRepository;

    @Mock
    private RecordTreatmentMedicineMapper recordTreatmentMedicineMapper;

    @InjectMocks
    private RecordTreatmentMedicineService recordTreatmentMedicineService;

    private RecordTreatment recordTreatment;
    private Medicine medicine;
    private MedicineLot lot;

    @BeforeEach
    void setUp() {
        recordTreatment = new RecordTreatment();
        recordTreatment.setRecordTreatmentId(20);

        medicine = new Medicine();
        medicine.setMedicineId(1);
        medicine.setMedicineName("Ya Hom Navakot");
        medicine.setUnitPrice(50.0);
        medicine.setStockRemaining(100);
        medicine.setStockIssued(10);

        lot = new MedicineLot();
        lot.setLotId(1);
        lot.setMedicine(medicine);
        lot.setLotNumber("LOT-2026-001");
        lot.setExpiryDate(LocalDate.now().plusMonths(6));
        lot.setQuantityRemaining(50);
        lot.setStatus("ACTIVE");
    }

    @Test
    void add_whenReceiptAlreadyIssued_shouldThrowBadRequestException() {
        RecordTreatmentMedicineRequestDTO request = new RecordTreatmentMedicineRequestDTO(20, 1, 2);

        Receipt receipt = new Receipt();
        receipt.setReceiptId(101);

        when(recordTreatmentRepository.findById(20)).thenReturn(Optional.of(recordTreatment));
        when(receiptRepository.findByRecordTreatment_RecordTreatmentId(20)).thenReturn(Optional.of(receipt));

        assertThatThrownBy(() -> recordTreatmentMedicineService.add(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot add medicine — a receipt has already been issued for this treatment");

        verifyNoInteractions(medicineRepository);
        verifyNoInteractions(medicineLotRepository);
        verify(recordTreatmentMedicineRepository, never()).save(any());
    }

    @Test
    void remove_whenReceiptAlreadyIssued_shouldThrowBadRequestException() {
        RecordTreatmentMedicine rtm = new RecordTreatmentMedicine();
        rtm.setRecordTreatmentMedicineId(5);
        rtm.setRecordTreatment(recordTreatment);
        rtm.setMedicine(medicine);
        rtm.setMedicineLot(lot);
        rtm.setQuantity(2);

        Receipt receipt = new Receipt();
        receipt.setReceiptId(101);

        when(recordTreatmentMedicineRepository.findById(5)).thenReturn(Optional.of(rtm));
        when(receiptRepository.findByRecordTreatment_RecordTreatmentId(20)).thenReturn(Optional.of(receipt));

        assertThatThrownBy(() -> recordTreatmentMedicineService.remove(5))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot remove medicine — a receipt has already been issued for this treatment");

        verify(recordTreatmentMedicineRepository, never()).delete(any());
        verify(medicineRepository, never()).save(any());
        verify(medicineLotRepository, never()).save(any());
    }

    @Test
    void add_whenNoReceipt_shouldDispenseMedicineSuccessfully() {
        RecordTreatmentMedicineRequestDTO request = new RecordTreatmentMedicineRequestDTO(20, 1, 2);

        when(recordTreatmentRepository.findById(20)).thenReturn(Optional.of(recordTreatment));
        when(receiptRepository.findByRecordTreatment_RecordTreatmentId(20)).thenReturn(Optional.empty());
        when(medicineRepository.findById(1)).thenReturn(Optional.of(medicine));
        when(medicineLotRepository.findByMedicine_MedicineIdOrderByExpiryDateAsc(1))
                .thenReturn(List.of(lot));
        when(recordTreatmentMedicineRepository.save(any(RecordTreatmentMedicine.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RecordTreatmentMedicineResponseDTO expectedResponse = RecordTreatmentMedicineResponseDTO.builder()
                .recordTreatmentMedicineId(1)
                .medicineId(1)
                .medicineName("Ya Hom Navakot")
                .quantity(2)
                .priceAtTime(50.0)
                .subTotal(100.0)
                .build();
        when(recordTreatmentMedicineMapper.toResponseDTO(any(RecordTreatmentMedicine.class)))
                .thenReturn(expectedResponse);

        RecordTreatmentMedicineResponseDTO result = recordTreatmentMedicineService.add(request);

        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(2);
        assertThat(result.getSubTotal()).isEqualTo(100.0);
        assertThat(lot.getQuantityRemaining()).isEqualTo(48);
        assertThat(medicine.getStockRemaining()).isEqualTo(98);
        verify(recordTreatmentMedicineRepository).save(any(RecordTreatmentMedicine.class));
    }

    @Test
    void remove_whenNoReceipt_shouldRemoveAndRestoreStock() {
        RecordTreatmentMedicine rtm = new RecordTreatmentMedicine();
        rtm.setRecordTreatmentMedicineId(5);
        rtm.setRecordTreatment(recordTreatment);
        rtm.setMedicine(medicine);
        rtm.setMedicineLot(lot);
        rtm.setQuantity(2);

        when(recordTreatmentMedicineRepository.findById(5)).thenReturn(Optional.of(rtm));
        when(receiptRepository.findByRecordTreatment_RecordTreatmentId(20)).thenReturn(Optional.empty());

        recordTreatmentMedicineService.remove(5);

        assertThat(lot.getQuantityRemaining()).isEqualTo(52);
        assertThat(medicine.getStockRemaining()).isEqualTo(102);
        assertThat(medicine.getStockIssued()).isEqualTo(8);
        verify(recordTreatmentMedicineRepository).delete(rtm);
        verify(medicineLotRepository).save(lot);
        verify(medicineRepository).save(medicine);
    }
}
