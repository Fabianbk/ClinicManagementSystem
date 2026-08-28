package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.ContactPersonRequestDTO;
import com.clinic.clinicmanagementsystem.dto.ContactPersonResponseDTO;
import com.clinic.clinicmanagementsystem.dto.HealthProfileRequestDTO;
import com.clinic.clinicmanagementsystem.dto.HealthProfileResponseDTO;
import com.clinic.clinicmanagementsystem.dto.PatientRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientResponseDTO;
import com.clinic.clinicmanagementsystem.dto.PrincipleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PrincipleResponseDTO;
import com.clinic.clinicmanagementsystem.entity.ContactPerson;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.entity.PatientAccount;
import com.clinic.clinicmanagementsystem.enums.IdType;
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.ContactPersonMapper;
import com.clinic.clinicmanagementsystem.mapper.HealthProfileMapper;
import com.clinic.clinicmanagementsystem.mapper.PatientMapper;
import com.clinic.clinicmanagementsystem.mapper.PrincipleMapper;
import com.clinic.clinicmanagementsystem.repository.ContactPersonRepository;
import com.clinic.clinicmanagementsystem.repository.PatientAccountRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final ContactPersonRepository contactPersonRepository;
    private final PatientAccountRepository patientAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUser currentUser;

    private final PatientMapper patientMapper;
    private final PrincipleMapper principleMapper;
    private final HealthProfileMapper healthProfileMapper;
    private final ContactPersonMapper contactPersonMapper;

    /**
     * Creates a patient along with whatever nested contactPersons / principle /
     * healthProfile were submitted in the same request. PatientMapper#toEntity
     * builds the whole object graph as brand-new objects; cascade = ALL on
     * Patient persists all of it together in this one save() call.
     * Also auto-registers a PatientAccount using mobile number as username and
     * formatted birthday (ddMMyyyy) as password.
     */
    public PatientResponseDTO create(PatientRequestDTO dto) {
        validateIdUniquenessOnCreate(dto);

        String username = dto.getMobileNumber() != null ? dto.getMobileNumber().trim() : "";
        if (patientAccountRepository.existsById(username)) {
            throw new DuplicateResourceException(
                    "Username '" + username + "' is already taken");
        }

        Patient patient = patientMapper.toEntity(dto);

        SimpleDateFormat sdf = new SimpleDateFormat("ddMMyyyy");
        String birthdayPassword = sdf.format(dto.getDateOfBirth());

        PatientAccount account = new PatientAccount();
        account.setUsername(username);
        account.setPassword(passwordEncoder.encode(birthdayPassword));
        account.setPatient(patient);
        patient.setPatientAccount(account);

        Patient saved = patientRepository.save(patient);

        return patientMapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getById(int patientId) {
        currentUser.requireSelfOrDoctor(patientId);
        return patientMapper.toResponseDTO(findPatientOrThrow(patientId));
    }

    @Transactional(readOnly = true)
    public Page<PatientResponseDTO> getAll(Pageable pageable) {
        return patientRepository.findAll(pageable).map(patientMapper::toResponseDTO);
    }

    /**
     * Updates Patient's own scalar fields only (name, contact info, etc).
     * Does NOT touch contactPersons / principle / healthProfile — use the
     * dedicated methods below for those.
     */
    public PatientResponseDTO updateBasicInfo(int patientId, PatientRequestDTO dto) {
        Patient existing = findPatientOrThrow(patientId);

        validateIdUniquenessOnUpdate(dto, existing);

        patientMapper.updateBasicInfo(dto, existing);

        if (dto.getHealthProfile() != null) {
            if (existing.getHealthProfile() == null) {
                existing.setHealthProfile(healthProfileMapper.toEntity(dto.getHealthProfile()));
            } else {
                healthProfileMapper.updateEntityFromDto(dto.getHealthProfile(), existing.getHealthProfile());
            }
        }

        if (dto.getPrinciple() != null) {
            if (existing.getPrinciple() == null) {
                existing.setPrinciple(principleMapper.toEntity(dto.getPrinciple()));
            } else {
                principleMapper.updateEntityFromDto(dto.getPrinciple(), existing.getPrinciple());
            }
        }

        if (dto.getContactPersons() != null) {
            if (existing.getContactPersons() == null) {
                existing.setContactPersons(new ArrayList<>());
            } else {
                existing.getContactPersons().clear();
            }
            for (ContactPersonRequestDTO contactDto : dto.getContactPersons()) {
                existing.getContactPersons().add(contactPersonMapper.toEntity(contactDto));
            }
        }

        return patientMapper.toResponseDTO(patientRepository.save(existing));
    }

    /** Updates the patient's TTM principle assessment in place; creates one if none exists yet. */
    public PrincipleResponseDTO updatePrinciple(int patientId, PrincipleRequestDTO dto) {
        Patient patient = findPatientOrThrow(patientId);

        if (patient.getPrinciple() == null) {
            patient.setPrinciple(principleMapper.toEntity(dto));
        } else {
            principleMapper.updateEntityFromDto(dto, patient.getPrinciple());
        }

        Patient saved = patientRepository.save(patient);
        return principleMapper.toResponseDTO(saved.getPrinciple());
    }

    /** Updates the patient's health profile in place; creates one if none exists yet. */
    public HealthProfileResponseDTO updateHealthProfile(int patientId, HealthProfileRequestDTO dto) {
        Patient patient = findPatientOrThrow(patientId);

        if (patient.getHealthProfile() == null) {
            patient.setHealthProfile(healthProfileMapper.toEntity(dto));
        } else {
            healthProfileMapper.updateEntityFromDto(dto, patient.getHealthProfile());
        }

        Patient saved = patientRepository.save(patient);
        return healthProfileMapper.toResponseDTO(saved.getHealthProfile());
    }

    /** Adds one emergency contact to the patient. */
    public ContactPersonResponseDTO addContactPerson(int patientId, ContactPersonRequestDTO dto) {
        Patient patient = findPatientOrThrow(patientId);

        if (patient.getContactPersons() == null) {
            patient.setContactPersons(new ArrayList<>());
        }

        ContactPerson contactPerson = contactPersonMapper.toEntity(dto);
        patient.getContactPersons().add(contactPerson);
        patientRepository.save(patient);

        return contactPersonMapper.toResponseDTO(contactPerson);
    }

    /**
     * Removes one emergency contact.
     */
    public void removeContactPerson(int patientId, int contactId) {
        Patient patient = findPatientOrThrow(patientId);

        boolean removed = patient.getContactPersons() != null
                && patient.getContactPersons().removeIf(cp -> cp.getContactId() == contactId);

        if (!removed) {
            throw new ResourceNotFoundException("ContactPerson", contactId);
        }

        contactPersonRepository.deleteById(contactId);
    }

    /**
     * Deletes the patient.
     */
    public void delete(int patientId) {
        Patient existing = findPatientOrThrow(patientId);
        patientRepository.delete(existing);
    }

    private Patient findPatientOrThrow(int patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
    }

    private void validateIdUniquenessOnCreate(PatientRequestDTO dto) {
        if (dto.getIdType() == IdType.THAI_ID && dto.getNationalId() != null) {
            if (patientRepository.existsByNationalId(dto.getNationalId().trim())) {
                throw new DuplicateResourceException(
                        "A patient with Thai National ID " + dto.getNationalId() + " already exists");
            }
        } else if (dto.getIdType() == IdType.PASSPORT && dto.getPassportNo() != null) {
            if (patientRepository.existsByPassportNo(dto.getPassportNo().trim())) {
                throw new DuplicateResourceException(
                        "A patient with Passport number " + dto.getPassportNo() + " already exists");
            }
        }
    }

    private void validateIdUniquenessOnUpdate(PatientRequestDTO dto, Patient existing) {
        if (dto.getIdType() == IdType.THAI_ID && dto.getNationalId() != null) {
            boolean changed = existing.getNationalId() == null || !existing.getNationalId().equals(dto.getNationalId().trim());
            if (changed && patientRepository.existsByNationalId(dto.getNationalId().trim())) {
                throw new DuplicateResourceException(
                        "A patient with Thai National ID " + dto.getNationalId() + " already exists");
            }
        } else if (dto.getIdType() == IdType.PASSPORT && dto.getPassportNo() != null) {
            boolean changed = existing.getPassportNo() == null || !existing.getPassportNo().equals(dto.getPassportNo().trim());
            if (changed && patientRepository.existsByPassportNo(dto.getPassportNo().trim())) {
                throw new DuplicateResourceException(
                        "A patient with Passport number " + dto.getPassportNo() + " already exists");
            }
        }
    }
}
