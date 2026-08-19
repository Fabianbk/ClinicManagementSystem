package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.PatientRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.entity.PatientAccount;
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.mapper.ContactPersonMapper;
import com.clinic.clinicmanagementsystem.mapper.HealthProfileMapper;
import com.clinic.clinicmanagementsystem.mapper.PatientMapper;
import com.clinic.clinicmanagementsystem.mapper.PrincipleMapper;
import com.clinic.clinicmanagementsystem.repository.ContactPersonRepository;
import com.clinic.clinicmanagementsystem.repository.PatientAccountRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.text.SimpleDateFormat;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ContactPersonRepository contactPersonRepository;

    @Mock
    private PatientAccountRepository patientAccountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PatientMapper patientMapper;

    @Mock
    private PrincipleMapper principleMapper;

    @Mock
    private HealthProfileMapper healthProfileMapper;

    @Mock
    private ContactPersonMapper contactPersonMapper;

    @InjectMocks
    private PatientService patientService;

    private PatientRequestDTO requestDTO;
    private Patient patientEntity;
    private Date birthDate;

    @BeforeEach
    void setUp() throws Exception {
        birthDate = new SimpleDateFormat("yyyy-MM-dd").parse("1995-08-15");

        requestDTO = PatientRequestDTO.builder()
                .fullname("Somchai Jaidee")
                .gender("Male")
                .idNumber("1234567890123")
                .dateOfBirth(birthDate)
                .dateOfBirthThai("15/08/2538")
                .occupation("Engineer")
                .marital("Single")
                .nationality("Thai")
                .ethnic("Thai")
                .religion("Buddhism")
                .bloodGroup("O+")
                .address("123 Sukhumvit Road")
                .mobileNumber("0812345678")
                .email("somchai@example.com")
                .build();

        patientEntity = new Patient();
        patientEntity.setPatientId(101);
        patientEntity.setFullname("Somchai Jaidee");
        patientEntity.setIdNumber("1234567890123");
        patientEntity.setDateOfBirth(birthDate);
        patientEntity.setMobileNumber("0812345678");
    }

    @Test
    void create_shouldAutoCreatePatientAccountWithMobileAndFormattedBirthday() {
        when(patientRepository.existsByIdNumber("1234567890123")).thenReturn(false);
        when(patientAccountRepository.existsById("0812345678")).thenReturn(false);
        when(patientMapper.toEntity(requestDTO)).thenReturn(patientEntity);
        when(patientRepository.save(patientEntity)).thenReturn(patientEntity);
        when(passwordEncoder.encode("15081995")).thenReturn("$2a$10$encodedHash15081995");

        PatientResponseDTO responseDTO = PatientResponseDTO.builder()
                .patientId(101)
                .fullname("Somchai Jaidee")
                .mobileNumber("0812345678")
                .build();
        when(patientMapper.toResponseDTO(patientEntity)).thenReturn(responseDTO);

        PatientResponseDTO result = patientService.create(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getPatientId()).isEqualTo(101);

        verify(patientRepository).save(patientEntity);
        assertThat(patientEntity.getPatientAccount()).isNotNull();
        assertThat(patientEntity.getPatientAccount().getUsername()).isEqualTo("0812345678");
        assertThat(patientEntity.getPatientAccount().getPassword()).isEqualTo("$2a$10$encodedHash15081995");
        assertThat(patientEntity.getPatientAccount().getPatient()).isEqualTo(patientEntity);
    }

    @Test
    void create_shouldThrowWhenIdNumberExists() {
        when(patientRepository.existsByIdNumber("1234567890123")).thenReturn(true);

        assertThatThrownBy(() -> patientService.create(requestDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("1234567890123");

        verify(patientRepository, never()).save(any());
        verify(patientAccountRepository, never()).save(any());
    }

    @Test
    void create_shouldThrowWhenMobileNumberExistsInPatientAccount() {
        when(patientRepository.existsByIdNumber("1234567890123")).thenReturn(false);
        when(patientAccountRepository.existsById("0812345678")).thenReturn(true);

        assertThatThrownBy(() -> patientService.create(requestDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("0812345678");

        verify(patientRepository, never()).save(any());
        verify(patientAccountRepository, never()).save(any());
    }
}
