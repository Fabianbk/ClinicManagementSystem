package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.RecordTreatmentRequestDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Appointment;
import com.clinic.clinicmanagementsystem.entity.Doctor;
import com.clinic.clinicmanagementsystem.entity.RecordTreatment;
import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.DuplicateResourceException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.RecordTreatmentMapper;
import com.clinic.clinicmanagementsystem.repository.AppointmentRepository;
import com.clinic.clinicmanagementsystem.repository.DoctorRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clinic.clinicmanagementsystem.security.CurrentUser;

@Service
@RequiredArgsConstructor
@Transactional
public class RecordTreatmentService {

    private final RecordTreatmentRepository recordTreatmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final RecordTreatmentMapper recordTreatmentMapper;
    private final CurrentUser currentUser;

    /**
     * Add Record Treatment. Appointment.recordTreatment is a
     * unique OneToOne, so a second attempt on the same appointment is
     * rejected here with a clear 409 instead of a raw DB constraint error.
     */
    public RecordTreatmentResponseDTO create(RecordTreatmentRequestDTO dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", dto.getAppointmentId()));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException(
                    "Cannot add a treatment record to a cancelled appointment");
        }

        if (recordTreatmentRepository.findByAppointment_AppointmentId(dto.getAppointmentId()).isPresent()) {
            throw new DuplicateResourceException(
                    "Appointment " + dto.getAppointmentId() + " already has a treatment record");
        }

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", dto.getDoctorId()));

        RecordTreatment recordTreatment = recordTreatmentMapper.toEntity(dto);
        recordTreatment.setAppointment(appointment);
        recordTreatment.setDoctor(doctor);

        return recordTreatmentMapper.toResponseDTO(recordTreatmentRepository.save(recordTreatment));
    }

    @Transactional(readOnly = true)
    public RecordTreatmentResponseDTO getById(int recordTreatmentId) {
        return recordTreatmentMapper.toResponseDTO(findRecordTreatmentOrThrow(recordTreatmentId));
    }

    @Transactional(readOnly = true)
    public Page<RecordTreatmentResponseDTO> getAll(Pageable pageable) {
        return recordTreatmentRepository.findAll(pageable).map(recordTreatmentMapper::toResponseDTO);
    }

    /** View Record Treatment — a patient's own history. */
    @Transactional(readOnly = true)
    public Page<RecordTreatmentResponseDTO> getByPatientId(int patientId, Pageable pageable) {
        currentUser.requireSelfOrDoctor(patientId);

        return recordTreatmentRepository.findByAppointment_Patient_PatientId(patientId, pageable)
                .map(recordTreatmentMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public RecordTreatmentResponseDTO getByAppointmentId(int appointmentId) {
        return recordTreatmentRepository.findByAppointment_AppointmentId(appointmentId)
                .map(recordTreatmentMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "RecordTreatment for appointment", appointmentId));
    }

    /** Edit Record Treatment */
    public RecordTreatmentResponseDTO update(int recordTreatmentId, RecordTreatmentRequestDTO dto) {
        RecordTreatment existing = findRecordTreatmentOrThrow(recordTreatmentId);
        recordTreatmentMapper.updateEntityFromDto(dto, existing);
        return recordTreatmentMapper.toResponseDTO(recordTreatmentRepository.save(existing));
    }

    private RecordTreatment findRecordTreatmentOrThrow(int recordTreatmentId) {
        return recordTreatmentRepository.findById(recordTreatmentId)
                .orElseThrow(() -> new ResourceNotFoundException("RecordTreatment", recordTreatmentId));
    }
}