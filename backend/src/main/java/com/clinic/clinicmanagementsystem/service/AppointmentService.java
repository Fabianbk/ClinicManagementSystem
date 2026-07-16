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

    /**
     * The core booking method. The slot availability check and the slot/appointment
     * saves all happen inside one @Transactional boundary, so a concurrent request
     * that books the same slot at the same moment will either:
     * - See BOOKED status and get a BadRequestException, or
     * - Hit the unique constraint on Appointment.slot_id and get a 409 from
     *   GlobalExceptionHandler's DataIntegrityViolationException handler.
     * Either way, double-booking is prevented.
     */
    public AppointmentResponseDTO book(AppointmentRequestDTO dto) {
        AppointmentSlot slot = appointmentSlotRepository.findById(dto.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentSlot", dto.getSlotId()));

        if (slot.getStatus() != AppointmentSlotStatus.AVAILABLE) {
            throw new BadRequestException(
                    "Slot " + dto.getSlotId() + " is not available for booking (status: "
                    + slot.getStatus() + ")");
        }

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));

        // Flip the slot to BOOKED first, then create the Appointment.
        // Both writes are in this transaction — if anything fails after this
        // point, both roll back together cleanly.
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
        return appointmentMapper.toResponseDTO(findAppointmentOrThrow(appointmentId));
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponseDTO> getAll(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(appointmentMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponseDTO> getByPatientId(int patientId, Pageable pageable) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }
        return appointmentRepository.findByPatient_PatientId(patientId, pageable)
                .map(appointmentMapper::toResponseDTO);
    }

    /**
     * Cancels a SCHEDULED appointment and reopens the slot so another patient
     * can book it. Only SCHEDULED appointments can be cancelled — attempting
     * to cancel a COMPLETED or NO_SHOW appointment is rejected.
     */
    public AppointmentResponseDTO cancel(int appointmentId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        validateTransition(appointment, AppointmentStatus.CANCELLED);

        appointment.setStatus(AppointmentStatus.CANCELLED);

        // Reopen the slot so it can be booked by someone else.
        AppointmentSlot slot = appointment.getAppointmentSlot();
        slot.setStatus(AppointmentSlotStatus.AVAILABLE);
        appointmentSlotRepository.save(slot);

        return appointmentMapper.toResponseDTO(appointmentRepository.save(appointment));
    }

    /**
     * Marks the appointment as completed after the visit. Slot stays BOOKED —
     * the time has passed, there is nothing to reopen.
     */
    public AppointmentResponseDTO complete(int appointmentId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        validateTransition(appointment, AppointmentStatus.COMPLETED);

        appointment.setStatus(AppointmentStatus.COMPLETED);
        return appointmentMapper.toResponseDTO(appointmentRepository.save(appointment));
    }

    /**
     * Marks the appointment as a no-show. Slot stays BOOKED — the time window
     * has already passed so there is no slot to reopen. The appointment record
     * is retained for clinic history tracking.
     */
    public AppointmentResponseDTO noShow(int appointmentId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        validateTransition(appointment, AppointmentStatus.NO_SHOW);

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        return appointmentMapper.toResponseDTO(appointmentRepository.save(appointment));
    }

    /**
     * Enforces valid status transitions. Only SCHEDULED appointments can move
     * to any other status — you cannot cancel a completed visit or mark a
     * cancelled appointment as a no-show.
     */
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
