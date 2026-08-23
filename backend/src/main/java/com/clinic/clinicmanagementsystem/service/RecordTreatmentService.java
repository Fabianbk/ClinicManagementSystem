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
import com.clinic.clinicmanagementsystem.mapper.PrincipleMapper;
import com.clinic.clinicmanagementsystem.mapper.HealthProfileMapper;
import com.clinic.clinicmanagementsystem.repository.AppointmentRepository;
import com.clinic.clinicmanagementsystem.repository.DoctorRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentRepository;
import com.clinic.clinicmanagementsystem.entity.AppointmentSlot;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.entity.WorkingSchedule;
import com.clinic.clinicmanagementsystem.enums.AppointmentSlotStatus;
import com.clinic.clinicmanagementsystem.repository.AppointmentSlotRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import com.clinic.clinicmanagementsystem.repository.WorkingScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clinic.clinicmanagementsystem.security.CurrentUser;

import java.util.Date;

@Service
@RequiredArgsConstructor
@Transactional
public class RecordTreatmentService {

    private final RecordTreatmentRepository recordTreatmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final WorkingScheduleRepository workingScheduleRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final RecordTreatmentMapper recordTreatmentMapper;
    private final PrincipleMapper principleMapper;
    private final HealthProfileMapper healthProfileMapper;
    private final CurrentUser currentUser;

    /**
     * Add Record Treatment. Supports both existing appointment and
     * auto-creating an appointment for walk-in patients.
     * Also syncs Principle and HealthProfile to the patient record.
     */
    public RecordTreatmentResponseDTO create(RecordTreatmentRequestDTO dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", dto.getDoctorId()));

        Appointment appointment;
        if (dto.getAppointmentId() != null && dto.getAppointmentId() > 0) {
            appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment", dto.getAppointmentId()));

            if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
                throw new BadRequestException(
                        "Cannot add a treatment record to a cancelled appointment");
            }

            if (recordTreatmentRepository.findByAppointment_AppointmentId(dto.getAppointmentId()).isPresent()) {
                throw new DuplicateResourceException(
                        "Appointment " + dto.getAppointmentId() + " already has a treatment record");
            }
        } else {
            // Auto create walk-in appointment for patient
            if (dto.getPatientId() == null || dto.getPatientId() <= 0) {
                throw new BadRequestException("Either appointmentId or patientId must be provided");
            }

            Patient patient = patientRepository.findById(dto.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));

            Date now = dto.getRecordDate() != null ? dto.getRecordDate() : new Date();
            java.time.LocalDate today = java.time.LocalDate.now();
            Date scheduleDate = java.sql.Date.valueOf(today);
            Date shiftStart = java.sql.Timestamp.valueOf(today.atTime(8, 0));
            Date shiftEnd = java.sql.Timestamp.valueOf(today.atTime(20, 0));

            WorkingSchedule schedule = workingScheduleRepository
                    .findByDoctor_DoctorId(doctor.getDoctorId()).stream()
                    .filter(s -> s.getDate() != null && s.getDate().toString().startsWith(today.toString()))
                    .findFirst()
                    .orElseGet(() -> {
                        WorkingSchedule ws = new WorkingSchedule();
                        ws.setDoctor(doctor);
                        ws.setDate(scheduleDate);
                        ws.setShiftStart(shiftStart);
                        ws.setShiftEnd(shiftEnd);
                        return workingScheduleRepository.save(ws);
                    });

            Date slotStart = now;
            Date slotEnd = new Date(now.getTime() + 30 * 60 * 1000);

            AppointmentSlot slot = new AppointmentSlot();
            slot.setWorkingSchedule(schedule);
            slot.setStartTime(slotStart);
            slot.setEndTime(slotEnd);
            slot.setStatus(AppointmentSlotStatus.BOOKED);
            slot = appointmentSlotRepository.save(slot);

            appointment = new Appointment();
            appointment.setAppointmentSlot(slot);
            appointment.setPatient(patient);
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointment = appointmentRepository.save(appointment);
        }

        // Mark appointment as COMPLETED upon recording treatment
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // Update Patient's Principle assessment if provided
        Patient patient = appointment.getPatient();
        if (dto.getPrinciple() != null) {
            if (patient.getPrinciple() == null) {
                patient.setPrinciple(principleMapper.toEntity(dto.getPrinciple()));
            } else {
                principleMapper.updateEntityFromDto(dto.getPrinciple(), patient.getPrinciple());
            }
            patientRepository.save(patient);
        }

        // Update Patient's Health Profile if provided
        if (dto.getHealthProfile() != null) {
            if (patient.getHealthProfile() == null) {
                patient.setHealthProfile(healthProfileMapper.toEntity(dto.getHealthProfile()));
            } else {
                healthProfileMapper.updateEntityFromDto(dto.getHealthProfile(), patient.getHealthProfile());
            }
            patientRepository.save(patient);
        }

        RecordTreatment recordTreatment = recordTreatmentMapper.toEntity(dto);
        recordTreatment.setAppointment(appointment);
        recordTreatment.setDoctor(doctor);
        if (recordTreatment.getRecordDate() == null) {
            recordTreatment.setRecordDate(new Date());
        }

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

        Patient patient = existing.getAppointment().getPatient();
        if (dto.getPrinciple() != null && patient != null) {
            if (patient.getPrinciple() == null) {
                patient.setPrinciple(principleMapper.toEntity(dto.getPrinciple()));
            } else {
                principleMapper.updateEntityFromDto(dto.getPrinciple(), patient.getPrinciple());
            }
            patientRepository.save(patient);
        }

        if (dto.getHealthProfile() != null && patient != null) {
            if (patient.getHealthProfile() == null) {
                patient.setHealthProfile(healthProfileMapper.toEntity(dto.getHealthProfile()));
            } else {
                healthProfileMapper.updateEntityFromDto(dto.getHealthProfile(), patient.getHealthProfile());
            }
            patientRepository.save(patient);
        }

        return recordTreatmentMapper.toResponseDTO(recordTreatmentRepository.save(existing));
    }

    private RecordTreatment findRecordTreatmentOrThrow(int recordTreatmentId) {
        return recordTreatmentRepository.findById(recordTreatmentId)
                .orElseThrow(() -> new ResourceNotFoundException("RecordTreatment", recordTreatmentId));
    }
}