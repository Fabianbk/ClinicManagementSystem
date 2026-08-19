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
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.ContactPersonMapper;
import com.clinic.clinicmanagementsystem.mapper.HealthProfileMapper;
import com.clinic.clinicmanagementsystem.mapper.PatientMapper;
import com.clinic.clinicmanagementsystem.mapper.PrincipleMapper;
import com.clinic.clinicmanagementsystem.repository.ContactPersonRepository;
import com.clinic.clinicmanagementsystem.repository.PatientAccountRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
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
        if (patientRepository.existsByIdNumber(dto.getIdNumber())) {
            throw new DuplicateResourceException(
                    "A patient with ID number " + dto.getIdNumber() + " already exists");
        }

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
     *
     * Why: Patient.principle and Patient.healthProfile are
     * @OneToOne(cascade = CascadeType.ALL) with NO orphanRemoval. If we mapped
     * a fresh PrincipleRequestDTO straight onto patient.setPrinciple(...),
     * MapStruct would build a brand-new Principle row and Hibernate would
     * just repoint the FK at it — the old row never gets deleted and quietly
     * piles up in the database. Same risk applies to contactPersons.
     */
    public PatientResponseDTO updateBasicInfo(int patientId, PatientRequestDTO dto) {
        Patient existing = findPatientOrThrow(patientId);

        boolean idNumberChanged = !existing.getIdNumber().equals(dto.getIdNumber());
        if (idNumberChanged && patientRepository.existsByIdNumber(dto.getIdNumber())) {
            throw new DuplicateResourceException(
                    "A patient with ID number " + dto.getIdNumber() + " already exists");
        }

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

        // contactPerson is the same object reference Hibernate just inserted,
        // so its generated ID is already populated here.
        return contactPersonMapper.toResponseDTO(contactPerson);
    }

    /**
     * Removes one emergency contact. Patient.contactPersons has no
     * orphanRemoval, so just taking it out of the in-memory list and saving
     * the patient would NOT delete the row in the database — it has to be
     * deleted explicitly here.
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
     * Deletes the patient. IMPORTANT: Patient.appointments has
     * cascade = CascadeType.ALL, so this also deletes every Appointment,
     * RecordTreatment, Receipt, and RecordTreatmentMedicine tied to this
     * patient — their entire medical history disappears with them. For a
     * clinic, that's almost certainly not what you want (medical records
     * usually need to be retained for legal/audit reasons even after a
     * patient leaves). Before wiring this up to a real DELETE endpoint,
     * consider a soft-delete instead (e.g. an `active` boolean on Patient
     * that you filter on, rather than an actual row deletion).
     */
    public void delete(int patientId) {
        Patient existing = findPatientOrThrow(patientId);
        patientRepository.delete(existing);
    }

    private Patient findPatientOrThrow(int patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
    }
}
