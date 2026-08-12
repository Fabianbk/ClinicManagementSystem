package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.AppointmentRequestDTO;
import com.clinic.clinicmanagementsystem.dto.AppointmentResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Appointment;
import com.clinic.clinicmanagementsystem.entity.AppointmentSlot;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.enums.AppointmentSlotStatus;
import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.AppointmentMapper;
import com.clinic.clinicmanagementsystem.repository.AppointmentRepository;
import com.clinic.clinicmanagementsystem.repository.AppointmentSlotRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final PatientRepository patientRepository;
    private final AppointmentMapper appointmentMapper;
    private final CurrentUser currentUser;

    /**
     * The core booking method. Only PATIENT can reach this endpoint
     * (@PreAuthorize on the controller); requireSelfOrDoctor still guards it
     * so a patient can never book on behalf of a different patientId.
     */
    public AppointmentResponseDTO book(AppointmentRequestDTO dto) {
        currentUser.requireSelfOrDoctor(dto.getPatientId());

        AppointmentSlot slot = appointmentSlotRepository.findById(dto.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentSlot", dto.getSlotId()));

        if (slot.getStatus() != AppointmentSlotStatus.AVAILABLE) {
            throw new BadRequestException(
                    "Slot " + dto.getSlotId() + " is not available for booking (status: "
                            + slot.getStatus() + ")");
        }

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));

        slot.setStatus(AppointmentSlotStatus.BOOKED);
        appointmentSlotRepository.save(slot);

        Appointment appointment = new Appointment();
        appointment.setAppointmentSlot(slot);
        appointment.setPatient(patient);
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        return appointmentMapper.toResponseDTO(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDTO getById(int appointmentId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        currentUser.requireSelfOrDoctor(appointment.getPatient().getPatientId());
        return appointmentMapper.toResponseDTO(appointment);
    }

    /** Doctor-only listing of every appointment — no per-patient filtering needed here. */
    @Transactional(readOnly = true)
    public Page<AppointmentResponseDTO> getAll(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(appointmentMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponseDTO> getByPatientId(int patientId, Pageable pageable) {
        currentUser.requireSelfOrDoctor(patientId);

        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }
        return appointmentRepository.findByPatient_PatientId(patientId, pageable)
                .map(appointmentMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponseDTO> getByDoctorId(int doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorId(doctorId, pageable)
                .map(appointmentMapper::toResponseDTO);
    }

    public AppointmentResponseDTO cancel(int appointmentId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        currentUser.requireSelfOrDoctor(appointment.getPatient().getPatientId());
        validateTransition(appointment, AppointmentStatus.CANCELLED);

        appointment.setStatus(AppointmentStatus.CANCELLED);

        AppointmentSlot slot = appointment.getAppointmentSlot();
        slot.setStatus(AppointmentSlotStatus.AVAILABLE);
        appointmentSlotRepository.save(slot);

        return appointmentMapper.toResponseDTO(appointmentRepository.save(appointment));
    }

    /** Doctor-only — slot stays BOOKED, nothing to reopen. */
    public AppointmentResponseDTO complete(int appointmentId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        validateTransition(appointment, AppointmentStatus.COMPLETED);

        appointment.setStatus(AppointmentStatus.COMPLETED);
        return appointmentMapper.toResponseDTO(appointmentRepository.save(appointment));
    }

    /** Doctor-only. */
    public AppointmentResponseDTO noShow(int appointmentId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        validateTransition(appointment, AppointmentStatus.NO_SHOW);

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        return appointmentMapper.toResponseDTO(appointmentRepository.save(appointment));
    }

    private void validateTransition(Appointment appointment, AppointmentStatus target) {
        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new BadRequestException(
                    "Cannot transition appointment to " + target
                            + " — current status is " + appointment.getStatus()
                            + " (only SCHEDULED appointments can be updated)");
        }
    }

    private Appointment findAppointmentOrThrow(int appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));
    }
}