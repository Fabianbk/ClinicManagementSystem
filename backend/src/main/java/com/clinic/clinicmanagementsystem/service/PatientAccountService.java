package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.security.CurrentUser;
import com.clinic.clinicmanagementsystem.dto.PatientAccountRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientAccountResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.entity.PatientAccount;
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.PatientAccountMapper;
import com.clinic.clinicmanagementsystem.repository.PatientAccountRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientAccountService {

    private final PatientAccountRepository patientAccountRepository;
    private final PatientRepository patientRepository;
    private final PatientAccountMapper patientAccountMapper;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUser currentUser;

    public PatientAccountResponseDTO create(PatientAccountRequestDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));

        if (patientAccountRepository.existsByPatient_PatientId(dto.getPatientId())) {
            throw new DuplicateResourceException(
                    "Patient " + dto.getPatientId() + " already has an account");
        }
        if (patientAccountRepository.existsById(dto.getUsername())) {
            throw new DuplicateResourceException(
                    "Username '" + dto.getUsername() + "' is already taken");
        }

        PatientAccount account = patientAccountMapper.toEntity(dto);
        account.setPatient(patient);
        account.setPassword(passwordEncoder.encode(dto.getPassword()));

        return patientAccountMapper.toResponseDTO(patientAccountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public PatientAccountResponseDTO getByPatientId(int patientId) {
        currentUser.requireSelfOrDoctor(patientId);

        return patientAccountRepository.findByPatient_PatientId(patientId)
                .map(patientAccountMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("PatientAccount for patient", patientId));
    }
}