package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.ReceiptItemDTO;
import com.clinic.clinicmanagementsystem.dto.ReceiptRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ReceiptResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Receipt;
import com.clinic.clinicmanagementsystem.entity.ReceiptItem;
import com.clinic.clinicmanagementsystem.entity.RecordTreatment;
import com.clinic.clinicmanagementsystem.entity.RecordTreatmentMedicine;
import com.clinic.clinicmanagementsystem.mapper.ReceiptMapper;
import com.clinic.clinicmanagementsystem.repository.ReceiptRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentMedicineRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReceiptServiceTest {

    @Mock
    private ReceiptRepository receiptRepository;

    @Mock
    private RecordTreatmentRepository recordTreatmentRepository;

    @Mock
    private RecordTreatmentMedicineRepository recordTreatmentMedicineRepository;

    @Mock
    private ReceiptMapper receiptMapper;

    @InjectMocks
    private ReceiptService receiptService;

    private RecordTreatment recordTreatment;

    @BeforeEach
    void setUp() {
        recordTreatment = new RecordTreatment();
        recordTreatment.setRecordTreatmentId(10);
    }

    @Test
    void issue_shouldCalculateMedicineTotalAndAdditionalItemsCorrectly() {
        RecordTreatmentMedicine med1 = new RecordTreatmentMedicine();
        med1.setSubTotal(100.0);
        RecordTreatmentMedicine med2 = new RecordTreatmentMedicine();
        med2.setSubTotal(150.0);

        List<RecordTreatmentMedicine> medicines = List.of(med1, med2);

        ReceiptItemDTO item1 = ReceiptItemDTO.builder().itemName("Doctor's fee").amount(1000.0).build();
        ReceiptItemDTO item2 = ReceiptItemDTO.builder().itemName("Registered mail").amount(35.0).build();

        ReceiptRequestDTO requestDTO = ReceiptRequestDTO.builder()
                .recordTreatmentId(10)
                .receiptDate(new Date())
                .paymentStatus("PAID")
                .paymentMethod("PROMPT_PAY")
                .additionalItems(List.of(item1, item2))
                .note("Sent via post")
                .build();

        Receipt entity = new Receipt();
        entity.setReceiptDate(requestDTO.getReceiptDate());
        entity.setPaymentStatus("PAID");
        entity.setPaymentMethod("PROMPT_PAY");

        when(recordTreatmentRepository.findById(10)).thenReturn(Optional.of(recordTreatment));
        when(receiptRepository.findByRecordTreatment_RecordTreatmentId(10)).thenReturn(Optional.empty());
        when(recordTreatmentMedicineRepository.findByRecordTreatment_RecordTreatmentId(10)).thenReturn(medicines);
        when(receiptMapper.toEntity(requestDTO)).thenReturn(entity);
        when(receiptRepository.save(any(Receipt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReceiptResponseDTO responseDTO = ReceiptResponseDTO.builder()
                .receiptId(1)
                .recordTreatmentId(10)
                .medicineTotal(250.0)
                .additionalItems(List.of(item1, item2))
                .totalPrice(1285.0)
                .paymentStatus("PAID")
                .paymentMethod("PROMPT_PAY")
                .note("Sent via post")
                .build();

        when(receiptMapper.toResponseDTO(any(Receipt.class))).thenReturn(responseDTO);

        ReceiptResponseDTO result = receiptService.issue(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getMedicineTotal()).isEqualTo(250.0);
        assertThat(result.getTotalPrice()).isEqualTo(1285.0);
        assertThat(result.getAdditionalItems()).hasSize(2);
        assertThat(entity.getMedicineTotal()).isEqualTo(250.0);
        assertThat(entity.getTotalPrice()).isEqualTo(1285.0);
        assertThat(entity.getAdditionalItems()).hasSize(2);
        assertThat(entity.getAdditionalItems().get(0).getItemName()).isEqualTo("Doctor's fee");
        assertThat(entity.getAdditionalItems().get(0).getAmount()).isEqualTo(1000.0);

        verify(receiptRepository).save(entity);
    }
}
