package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.MedicineRequestDTO;
import com.clinic.clinicmanagementsystem.dto.MedicineResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Medicine;
import com.clinic.clinicmanagementsystem.mapper.MedicineLotMapper;
import com.clinic.clinicmanagementsystem.mapper.MedicineMapper;
import com.clinic.clinicmanagementsystem.repository.MedicineLotRepository;
import com.clinic.clinicmanagementsystem.repository.MedicineRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineLotRepository medicineLotRepository;

    @Mock
    private MedicineMapper medicineMapper;

    @Mock
    private MedicineLotMapper medicineLotMapper;

    @InjectMocks
    private MedicineService medicineService;

    private Medicine testMedicine;
    private MedicineRequestDTO testRequestDTO;
    private MedicineResponseDTO testResponseDTO;

    @BeforeEach
    void setUp() {
        testMedicine = new Medicine();
        testMedicine.setMedicineId(1);
        testMedicine.setMedicineName("ยาประทุมนพคุณ");
        testMedicine.setUnitPrice(120.0);
        testMedicine.setIsActive(true);

        testRequestDTO = new MedicineRequestDTO();
        testRequestDTO.setMedicineName("ยาประทุมนพคุณ");
        testRequestDTO.setUnitPrice(120.0);

        testResponseDTO = new MedicineResponseDTO();
        testResponseDTO.setMedicineId(1);
        testResponseDTO.setMedicineName("ยาประทุมนพคุณ");
        testResponseDTO.setUnitPrice(120.0);
        testResponseDTO.setIsActive(true);
    }

    @Test
    void create_defaultIsActive_shouldBeTrue() {
        when(medicineRepository.existsByMedicineNameIgnoreCase(any())).thenReturn(false);
        when(medicineMapper.toEntity(any(MedicineRequestDTO.class))).thenReturn(testMedicine);
        when(medicineRepository.save(any(Medicine.class))).thenReturn(testMedicine);
        when(medicineMapper.toResponseDTO(any(Medicine.class))).thenReturn(testResponseDTO);
        when(medicineLotRepository.findByMedicine_MedicineIdOrderByExpiryDateAsc(eq(1)))
                .thenReturn(Collections.emptyList());

        MedicineResponseDTO created = medicineService.create(testRequestDTO);

        assertThat(created).isNotNull();
        assertThat(testMedicine.getIsActive()).isTrue();
        verify(medicineRepository).save(testMedicine);
    }

    @Test
    void delete_shouldSoftDelete_setsIsActiveFalse_doesNotCallDelete() {
        testMedicine.setIsActive(true);
        when(medicineRepository.findById(1)).thenReturn(Optional.of(testMedicine));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(testMedicine);

        medicineService.delete(1);

        assertThat(testMedicine.getIsActive()).isFalse();
        verify(medicineRepository).save(testMedicine);
        verify(medicineRepository, never()).delete(any(Medicine.class));
    }

    @Test
    void toggleStatus_fromActiveToInactive_shouldPersistFalse() {
        testMedicine.setIsActive(true);
        when(medicineRepository.findById(1)).thenReturn(Optional.of(testMedicine));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(testMedicine);
        when(medicineMapper.toResponseDTO(any(Medicine.class))).thenReturn(testResponseDTO);
        when(medicineLotRepository.findByMedicine_MedicineIdOrderByExpiryDateAsc(eq(1)))
                .thenReturn(Collections.emptyList());

        medicineService.toggleStatus(1);

        assertThat(testMedicine.getIsActive()).isFalse();
        verify(medicineRepository).save(testMedicine);
    }

    @Test
    void toggleStatus_fromInactiveToActive_shouldPersistTrue() {
        testMedicine.setIsActive(false);
        when(medicineRepository.findById(1)).thenReturn(Optional.of(testMedicine));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(testMedicine);
        when(medicineMapper.toResponseDTO(any(Medicine.class))).thenReturn(testResponseDTO);
        when(medicineLotRepository.findByMedicine_MedicineIdOrderByExpiryDateAsc(eq(1)))
                .thenReturn(Collections.emptyList());

        medicineService.toggleStatus(1);

        assertThat(testMedicine.getIsActive()).isTrue();
        verify(medicineRepository).save(testMedicine);
    }

    @Test
    void getAll_activeOnlyTrue_shouldQueryFindByIsActiveTrue() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medicine> page = new PageImpl<>(List.of(testMedicine));
        when(medicineRepository.findByIsActiveTrue(pageable)).thenReturn(page);
        when(medicineMapper.toResponseDTO(testMedicine)).thenReturn(testResponseDTO);
        when(medicineLotRepository.findByMedicine_MedicineIdOrderByExpiryDateAsc(eq(1)))
                .thenReturn(Collections.emptyList());

        Page<MedicineResponseDTO> result = medicineService.getAll(true, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(medicineRepository).findByIsActiveTrue(pageable);
        verify(medicineRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void getAll_activeOnlyFalse_shouldQueryFindAll() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medicine> page = new PageImpl<>(List.of(testMedicine));
        when(medicineRepository.findAll(pageable)).thenReturn(page);
        when(medicineMapper.toResponseDTO(testMedicine)).thenReturn(testResponseDTO);
        when(medicineLotRepository.findByMedicine_MedicineIdOrderByExpiryDateAsc(eq(1)))
                .thenReturn(Collections.emptyList());

        Page<MedicineResponseDTO> result = medicineService.getAll(false, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(medicineRepository).findAll(pageable);
        verify(medicineRepository, never()).findByIsActiveTrue(any(Pageable.class));
    }
}
