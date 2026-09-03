package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.PatientRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.enums.BloodGroupAbo;
import com.clinic.clinicmanagementsystem.enums.BloodGroupRh;
import com.clinic.clinicmanagementsystem.enums.Gender;
import com.clinic.clinicmanagementsystem.enums.IdType;
import com.clinic.clinicmanagementsystem.enums.MaritalStatus;
import com.clinic.clinicmanagementsystem.enums.TreatmentRights;
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.mapper.ContactPersonMapper;
import com.clinic.clinicmanagementsystem.mapper.HealthProfileMapper;
import com.clinic.clinicmanagementsystem.mapper.PatientMapper;
import com.clinic.clinicmanagementsystem.mapper.PrincipleMapper;
import com.clinic.clinicmanagementsystem.repository.ContactPersonRepository;
import com.clinic.clinicmanagementsystem.repository.PatientAccountRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

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
    private CurrentUser currentUser;

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
                .idType(IdType.THAI_ID)
                .nationalId("1234567890123")
                .gender(Gender.MALE)
                .dateOfBirth(birthDate)
                .occupation("Engineer")
                .maritalStatus(MaritalStatus.SINGLE)
                .citizenship("Thai")
                .ethnicity("Thai")
                .religion("Buddhism")
                .bloodGroupAbo(BloodGroupAbo.O)
                .bloodGroupRh(BloodGroupRh.POSITIVE)
                .treatmentRights(TreatmentRights.PAY_DIRECT)
                .houseNo("123")
                .road("Sukhumvit Road")
                .province("Bangkok")
                .mobileNumber("0812345678")
                .email("somchai@example.com")
                .build();

        patientEntity = new Patient();
        patientEntity.setPatientId(101);
        patientEntity.setFullname("Somchai Jaidee");
        patientEntity.setIdType(IdType.THAI_ID);
        patientEntity.setNationalId("1234567890123");
        patientEntity.setGender(Gender.MALE);
        patientEntity.setDateOfBirth(birthDate);
        patientEntity.setMobileNumber("0812345678");
    }

    @Test
    void create_shouldAutoCreatePatientAccountWithMobileAndFormattedBirthday() {
        when(patientRepository.existsByNationalId("1234567890123")).thenReturn(false);
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
    void create_shouldThrowWhenNationalIdExists() {
        when(patientRepository.existsByNationalId("1234567890123")).thenReturn(true);

        assertThatThrownBy(() -> patientService.create(requestDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("1234567890123");

        verify(patientRepository, never()).save(any());
        verify(patientAccountRepository, never()).save(any());
    }

    @Test
    void create_shouldThrowWhenMobileNumberExistsInPatientAccount() {
        when(patientRepository.existsByNationalId("1234567890123")).thenReturn(false);
        when(patientAccountRepository.existsById("0812345678")).thenReturn(true);

        assertThatThrownBy(() -> patientService.create(requestDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("0812345678");

        verify(patientRepository, never()).save(any());
        verify(patientAccountRepository, never()).save(any());
    }

    @Test
    void getById_shouldCheckPermissionAndReturnPatient() {
        when(patientRepository.findById(101)).thenReturn(Optional.of(patientEntity));
        PatientResponseDTO responseDTO = PatientResponseDTO.builder()
                .patientId(101)
                .fullname("Somchai Jaidee")
                .build();
        when(patientMapper.toResponseDTO(patientEntity)).thenReturn(responseDTO);

        PatientResponseDTO result = patientService.getById(101);

        assertThat(result).isNotNull();
        assertThat(result.getFullname()).isEqualTo("Somchai Jaidee");
        verify(currentUser).requireSelfOrDoctor(101);
    }

    @Test
    void getAll_withoutQuery_shouldCallFindAll() {
        when(patientRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(patientEntity)));
        PatientResponseDTO responseDTO = PatientResponseDTO.builder().patientId(101).fullname("Somchai Jaidee").build();
        when(patientMapper.toResponseDTO(patientEntity)).thenReturn(responseDTO);

        Page<PatientResponseDTO> result = patientService.getAll(null, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        verify(patientRepository).findAll(any(Pageable.class));
        verify(patientRepository, never()).searchPatients(any(), any());
    }

    @Test
    void getAll_withTextQuery_shouldCallSearchPatients() {
        when(patientRepository.searchPatients(eq("Somchai"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(patientEntity)));
        PatientResponseDTO responseDTO = PatientResponseDTO.builder().patientId(101).fullname("Somchai Jaidee").build();
        when(patientMapper.toResponseDTO(patientEntity)).thenReturn(responseDTO);

        Page<PatientResponseDTO> result = patientService.getAll("Somchai", PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        verify(patientRepository).searchPatients(eq("Somchai"), any(Pageable.class));
    }

    @Test
    void getAll_withHnQuery_shouldCallSearchPatientsWithId() {
        when(patientRepository.searchPatientsWithId(eq("P-00101"), eq(101), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(patientEntity)));
        PatientResponseDTO responseDTO = PatientResponseDTO.builder().patientId(101).fullname("Somchai Jaidee").build();
        when(patientMapper.toResponseDTO(patientEntity)).thenReturn(responseDTO);

        Page<PatientResponseDTO> result = patientService.getAll("P-00101", PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        verify(patientRepository).searchPatientsWithId(eq("P-00101"), eq(101), any(Pageable.class));
    }
}
