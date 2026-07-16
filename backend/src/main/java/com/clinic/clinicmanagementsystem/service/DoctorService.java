package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.DoctorChangePasswordRequestDTO;
import com.clinic.clinicmanagementsystem.dto.DoctorRequestDTO;
import com.clinic.clinicmanagementsystem.dto.DoctorResponseDTO;
import com.clinic.clinicmanagementsystem.dto.DoctorUpdateRequestDTO;
import com.clinic.clinicmanagementsystem.entity.Doctor;
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.DoctorMapper;
import com.clinic.clinicmanagementsystem.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorMapper doctorMapper;
    private final PasswordEncoder passwordEncoder;

    public DoctorResponseDTO create(DoctorRequestDTO dto) {
        if (doctorRepository.existsByUsername(dto.getUsername())) {
            throw new DuplicateResourceException(
                    "A doctor with username '" + dto.getUsername() + "' already exists");
        }

        Doctor doctor = doctorMapper.toEntity(dto);
        doctor.setPassword(passwordEncoder.encode(dto.getPassword()));

        Doctor saved = doctorRepository.save(doctor);
        return doctorMapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public DoctorResponseDTO getById(int doctorId) {
        return doctorMapper.toResponseDTO(findDoctorOrThrow(doctorId));
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponseDTO> getAll(Pageable pageable) {
        return doctorRepository.findAll(pageable).map(doctorMapper::toResponseDTO);
    }

    /** Updates username / fullname / physicianLicenseNo only. Password is never touched here. */
    public DoctorResponseDTO updateProfile(int doctorId, DoctorUpdateRequestDTO dto) {
        Doctor existing = findDoctorOrThrow(doctorId);

        boolean usernameChanged = !existing.getUsername().equals(dto.getUsername());
        if (usernameChanged && doctorRepository.existsByUsername(dto.getUsername())) {
            throw new DuplicateResourceException(
                    "A doctor with username '" + dto.getUsername() + "' already exists");
        }

        doctorMapper.updateProfile(dto, existing);
        return doctorMapper.toResponseDTO(doctorRepository.save(existing));
    }

    /**
     * Kept as its own endpoint, separate from updateProfile, so editing a
     * doctor's name or license number never requires resending a password.
     */
    public void changePassword(int doctorId, DoctorChangePasswordRequestDTO dto) {
        Doctor existing = findDoctorOrThrow(doctorId);
        existing.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        doctorRepository.save(existing);
    }

    /**
     * Deletes the doctor. IMPORTANT — bigger blast radius than it looks:
     * Doctor.workingSchedules and Doctor.recordTreatments both have
     * cascade = CascadeType.ALL, and those cascade further down their own
     * chains (WorkingSchedule -> AppointmentSlot -> Appointment ->
     * RecordTreatment -> Receipt / RecordTreatmentMedicine). Deleting one
     * doctor can therefore wipe out every appointment, treatment record, and
     * receipt ever tied to them. Same reasoning as PatientService#delete —
     * strongly consider a soft-delete (`active` flag) before this is ever
     * exposed on a real endpoint.
     */
    public void delete(int doctorId) {
        Doctor existing = findDoctorOrThrow(doctorId);
        doctorRepository.delete(existing);
    }

    private Doctor findDoctorOrThrow(int doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));
    }
}
