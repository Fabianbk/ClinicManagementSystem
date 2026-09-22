package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.ChangePasswordRequestDTO;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.entity.PatientAccount;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.PatientAccountMapper;
import com.clinic.clinicmanagementsystem.repository.PatientAccountRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientAccountServiceTest {

    @Mock
    private PatientAccountRepository patientAccountRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PatientAccountMapper patientAccountMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CurrentUser currentUser;

    @InjectMocks
    private PatientAccountService patientAccountService;

    private Patient patient;
    private PatientAccount account;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setPatientId(1);
        patient.setFullname("Test Patient");

        account = new PatientAccount();
        account.setUsername("0812345678");
        account.setPassword("$2a$10$encodedOldPassword");
        account.setPatient(patient);
    }

    @Test
    void changePassword_success() {
        ChangePasswordRequestDTO dto = ChangePasswordRequestDTO.builder()
                .oldPassword("oldPass123")
                .newPassword("newPass456")
                .build();

        when(patientAccountRepository.findByPatient_PatientId(1)).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("oldPass123", "$2a$10$encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.matches("newPass456", "$2a$10$encodedOldPassword")).thenReturn(false);
        when(passwordEncoder.encode("newPass456")).thenReturn("$2a$10$encodedNewPassword");

        patientAccountService.changePassword(1, dto);

        verify(currentUser).requireSelfOrDoctor(1);
        verify(patientAccountRepository).save(account);
        verify(passwordEncoder).encode("newPass456");
    }

    @Test
    void changePassword_wrongOldPassword_throwsBadRequestException() {
        ChangePasswordRequestDTO dto = ChangePasswordRequestDTO.builder()
                .oldPassword("wrongPass")
                .newPassword("newPass456")
                .build();

        when(patientAccountRepository.findByPatient_PatientId(1)).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("wrongPass", "$2a$10$encodedOldPassword")).thenReturn(false);

        assertThatThrownBy(() -> patientAccountService.changePassword(1, dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("รหัสผ่านปัจจุบันไม่ถูกต้อง");

        verify(patientAccountRepository, never()).save(any());
    }

    @Test
    void changePassword_sameNewPassword_throwsBadRequestException() {
        ChangePasswordRequestDTO dto = ChangePasswordRequestDTO.builder()
                .oldPassword("oldPass123")
                .newPassword("oldPass123")
                .build();

        when(patientAccountRepository.findByPatient_PatientId(1)).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("oldPass123", "$2a$10$encodedOldPassword")).thenReturn(true);

        assertThatThrownBy(() -> patientAccountService.changePassword(1, dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม");

        verify(patientAccountRepository, never()).save(any());
    }

    @Test
    void changePassword_accountNotFound_throwsResourceNotFoundException() {
        ChangePasswordRequestDTO dto = ChangePasswordRequestDTO.builder()
                .oldPassword("oldPass123")
                .newPassword("newPass456")
                .build();

        when(patientAccountRepository.findByPatient_PatientId(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> patientAccountService.changePassword(99, dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
