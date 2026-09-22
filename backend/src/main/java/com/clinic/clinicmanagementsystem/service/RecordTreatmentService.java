package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.HealthProfileResponseDTO;
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
import com.clinic.clinicmanagementsystem.enums.TreatmentProgramType;
import com.clinic.clinicmanagementsystem.repository.AppointmentSlotRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import com.clinic.clinicmanagementsystem.repository.ReceiptRepository;
import com.clinic.clinicmanagementsystem.repository.WorkingScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
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
    private final ReceiptRepository receiptRepository;
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
            // Walk-in treatment flow: requires patientId and valid slotId from doctor's working schedule on recordDate
            if (dto.getPatientId() == null || dto.getPatientId() <= 0) {
                throw new BadRequestException("Either appointmentId or patientId must be provided");
            }

            Patient patient = patientRepository.findById(dto.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));

            Date recordDate = dto.getRecordDate() != null ? dto.getRecordDate() : new Date();
            java.time.LocalDate recordLocalDate = java.time.Instant.ofEpochMilli(recordDate.getTime())
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDate();

            List<WorkingSchedule> doctorSchedules = workingScheduleRepository.findByDoctor_DoctorId(doctor.getDoctorId());
            boolean hasScheduleOnDate = doctorSchedules.stream().anyMatch(s -> {
                if (s.getDate() == null) return false;
                java.time.LocalDate scheduleLocalDate = java.time.Instant.ofEpochMilli(s.getDate().getTime())
                        .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                return scheduleLocalDate.isEqual(recordLocalDate);
            });

            if (!hasScheduleOnDate) {
                throw new BadRequestException(
                        "แพทย์ยังไม่มีตารางเวลาปฏิบัติงานในวันที่เลือก กรุณากำหนดตารางเวลาปฏิบัติงานก่อนบันทึกการรักษา");
            }

            if (dto.getSlotId() == null || dto.getSlotId() <= 0) {
                throw new BadRequestException(
                        "กรุณาระบุช่วงเวลาตรวจ (slotId) สำหรับผู้ป่วย Walk-in");
            }

            AppointmentSlot slot = appointmentSlotRepository.findById(dto.getSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("AppointmentSlot", dto.getSlotId()));

            if (slot.getWorkingSchedule() == null || slot.getWorkingSchedule().getDoctor() == null ||
                    slot.getWorkingSchedule().getDoctor().getDoctorId() != doctor.getDoctorId()) {
                throw new BadRequestException("ช่วงเวลาที่เลือกไม่ใช่ของแพทย์ผู้ตรวจ");
            }

            java.time.LocalDate slotLocalDate = java.time.Instant.ofEpochMilli(slot.getWorkingSchedule().getDate().getTime())
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            if (!slotLocalDate.isEqual(recordLocalDate)) {
                throw new BadRequestException("ช่วงเวลาที่เลือกไม่ตรงกับวันที่บันทึกการรักษา");
            }

            if (slot.getStatus() == AppointmentSlotStatus.BLOCKED) {
                throw new BadRequestException("ช่วงเวลาที่เลือกถูกระงับการใช้งาน (BLOCKED)");
            }

            if (slot.getStatus() == AppointmentSlotStatus.BOOKED || slot.getAppointment() != null) {
                throw new BadRequestException("ช่วงเวลาที่เลือกมีนัดหมายอื่นอยู่แล้ว กรุณาเลือกช่วงเวลาอื่น");
            }

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

        RecordTreatment recordTreatment = recordTreatmentMapper.toEntity(dto);
        recordTreatment.setAppointment(appointment);
        recordTreatment.setDoctor(doctor);
        if (recordTreatment.getRecordDate() == null) {
            recordTreatment.setRecordDate(new Date());
        }

        // Attach new HealthProfile specific to this treatment visit
        if (dto.getHealthProfile() != null) {
            recordTreatment.setHealthProfile(healthProfileMapper.toEntity(dto.getHealthProfile()));
        }

        ensureTreatmentProgramSummary(recordTreatment);

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

    /** Fetch most recent HealthProfile for pre-filling treatment forms. */
    @Transactional(readOnly = true)
    public HealthProfileResponseDTO getLatestHealthProfileByPatientId(int patientId) {
        currentUser.requireSelfOrDoctor(patientId);

        return recordTreatmentRepository
                .findFirstByAppointment_Patient_PatientIdAndHealthProfileIsNotNullOrderByRecordDateDescRecordTreatmentIdDesc(patientId)
                .map(RecordTreatment::getHealthProfile)
                .map(healthProfileMapper::toResponseDTO)
                .orElse(null);
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
        Date originalRecordDate = existing.getRecordDate();
        boolean hasReceipt = receiptRepository.findByRecordTreatment_RecordTreatmentId(recordTreatmentId).isPresent();

        recordTreatmentMapper.updateEntityFromDto(dto, existing);

        if (hasReceipt && originalRecordDate != null) {
            // Once a receipt has been issued, preserve original record date for financial/audit integrity
            existing.setRecordDate(originalRecordDate);
        }

        Patient patient = existing.getAppointment().getPatient();
        if (dto.getPrinciple() != null && patient != null) {
            if (patient.getPrinciple() == null) {
                patient.setPrinciple(principleMapper.toEntity(dto.getPrinciple()));
            } else {
                principleMapper.updateEntityFromDto(dto.getPrinciple(), patient.getPrinciple());
            }
            patientRepository.save(patient);
        }

        // Update visit's HealthProfile
        if (dto.getHealthProfile() != null) {
            if (existing.getHealthProfile() == null) {
                existing.setHealthProfile(healthProfileMapper.toEntity(dto.getHealthProfile()));
            } else {
                healthProfileMapper.updateEntityFromDto(dto.getHealthProfile(), existing.getHealthProfile());
            }
        }

        ensureTreatmentProgramSummary(existing);

        return recordTreatmentMapper.toResponseDTO(recordTreatmentRepository.save(existing));
    }

    private void ensureTreatmentProgramSummary(RecordTreatment recordTreatment) {
        if (recordTreatment.getTreatmentProgram() != null && !recordTreatment.getTreatmentProgram().isBlank()) {
            return;
        }
        if (recordTreatment.getTreatmentPrograms() == null || recordTreatment.getTreatmentPrograms().isEmpty()) {
            return;
        }
        List<String> list = new ArrayList<>();
        if (recordTreatment.getTreatmentPrograms().contains(TreatmentProgramType.MASSAGE)) {
            String details = recordTreatment.getTreatmentProgramMassageDetails();
            list.add(details != null && !details.isBlank() ? "นวด/หัตถการ (" + details + ")" : "นวด/หัตถการ");
        }
        if (recordTreatment.getTreatmentPrograms().contains(TreatmentProgramType.HERBAL_COMPRESS)) {
            list.add("ประคบสมุนไพร");
        }
        if (recordTreatment.getTreatmentPrograms().contains(TreatmentProgramType.HERBAL_STEAM)) {
            list.add("อบสมุนไพร");
        }
        if (recordTreatment.getTreatmentPrograms().contains(TreatmentProgramType.HERBAL_MEDICINE)) {
            list.add("จ่ายยาสมุนไพร");
        }
        if (recordTreatment.getTreatmentPrograms().contains(TreatmentProgramType.CONSULTATION)) {
            list.add("ให้คำปรึกษาทางการแพทย์");
        }
        if (recordTreatment.getTreatmentPrograms().contains(TreatmentProgramType.OTHER)) {
            String other = recordTreatment.getTreatmentProgramOther();
            list.add(other != null && !other.isBlank() ? "อื่นๆ (" + other + ")" : "อื่นๆ");
        }
        recordTreatment.setTreatmentProgram(String.join(", ", list));
    }

    private RecordTreatment findRecordTreatmentOrThrow(int recordTreatmentId) {
        return recordTreatmentRepository.findById(recordTreatmentId)
                .orElseThrow(() -> new ResourceNotFoundException("RecordTreatment", recordTreatmentId));
    }
}