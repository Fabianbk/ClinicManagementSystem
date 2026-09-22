package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.HealthProfileRequestDTO;
import com.clinic.clinicmanagementsystem.dto.HealthProfileResponseDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentRequestDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentResponseDTO;
import com.clinic.clinicmanagementsystem.entity.*;
import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import com.clinic.clinicmanagementsystem.enums.SymptomCause;
import com.clinic.clinicmanagementsystem.mapper.HealthProfileMapper;
import com.clinic.clinicmanagementsystem.mapper.PrincipleMapper;
import com.clinic.clinicmanagementsystem.mapper.RecordTreatmentMapper;
import com.clinic.clinicmanagementsystem.repository.*;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.Optional;
import java.util.Set;

import com.clinic.clinicmanagementsystem.enums.AppointmentSlotStatus;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecordTreatmentServiceTest {

    @Mock
    private RecordTreatmentRepository recordTreatmentRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private AppointmentSlotRepository appointmentSlotRepository;
    @Mock
    private WorkingScheduleRepository workingScheduleRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private ReceiptRepository receiptRepository;
    @Mock
    private RecordTreatmentMapper recordTreatmentMapper;
    @Mock
    private PrincipleMapper principleMapper;
    @Mock
    private HealthProfileMapper healthProfileMapper;
    @Mock
    private CurrentUser currentUser;

    @InjectMocks
    private RecordTreatmentService recordTreatmentService;

    private Doctor doctor;
    private Patient patient;
    private Appointment appointment;
    private HealthProfile healthProfile;

    @BeforeEach
    void setUp() {
        doctor = new Doctor();
        doctor.setDoctorId(1);
        doctor.setFullname("Dr. Somsak");

        patient = new Patient();
        patient.setPatientId(10);
        patient.setFullname("Somchai");

        appointment = new Appointment();
        appointment.setAppointmentId(100);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setPatient(patient);

        healthProfile = new HealthProfile();
        healthProfile.setHealthId(5);
        healthProfile.setDrugAllergy("Penicillin");
        healthProfile.setUnderlyingDisease("Diabetes");
    }

    @Test
    void create_shouldAttachHealthProfileToRecordTreatment() {
        HealthProfileRequestDTO hpDto = HealthProfileRequestDTO.builder()
                .drugAllergy("Penicillin")
                .underlyingDisease("Diabetes")
                .build();

        Set<SymptomCause> causes = Set.of(SymptomCause.FOOD, SymptomCause.POSTURE);
        RecordTreatmentRequestDTO requestDTO = RecordTreatmentRequestDTO.builder()
                .appointmentId(100)
                .doctorId(1)
                .recordDate(new Date())
                .symptoms("Back pain")
                .bicepRt("2+")
                .bicepLt("2+")
                .tricepsRt("2+")
                .tricepsLt("2+")
                .kneeRt("2+")
                .kneeLt("2+")
                .ankleRt("2+")
                .ankleLt("2+")
                .causesOfSymptoms(causes)
                .causeOfSymptomsOther("Lift heavy box")
                .healthProfile(hpDto)
                .build();

        RecordTreatment entity = new RecordTreatment();
        entity.setSymptoms("Back pain");
        entity.setBicepRt("2+");
        entity.setBicepLt("2+");
        entity.setTricepsRt("2+");
        entity.setTricepsLt("2+");
        entity.setKneeRt("2+");
        entity.setKneeLt("2+");
        entity.setAnkleRt("2+");
        entity.setAnkleLt("2+");
        entity.setCausesOfSymptoms(causes);
        entity.setCauseOfSymptomsOther("Lift heavy box");

        when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findById(100)).thenReturn(Optional.of(appointment));
        when(recordTreatmentRepository.findByAppointment_AppointmentId(100)).thenReturn(Optional.empty());
        when(recordTreatmentMapper.toEntity(requestDTO)).thenReturn(entity);
        when(healthProfileMapper.toEntity(hpDto)).thenReturn(healthProfile);
        when(recordTreatmentRepository.save(any(RecordTreatment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecordTreatmentResponseDTO expectedResponse = RecordTreatmentResponseDTO.builder()
                .recordTreatmentId(1)
                .symptoms("Back pain")
                .bicepRt("2+")
                .bicepLt("2+")
                .tricepsRt("2+")
                .tricepsLt("2+")
                .kneeRt("2+")
                .kneeLt("2+")
                .ankleRt("2+")
                .ankleLt("2+")
                .causesOfSymptoms(causes)
                .causeOfSymptomsOther("Lift heavy box")
                .build();
        when(recordTreatmentMapper.toResponseDTO(any(RecordTreatment.class))).thenReturn(expectedResponse);

        RecordTreatmentResponseDTO result = recordTreatmentService.create(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getBicepRt()).isEqualTo("2+");
        assertThat(result.getKneeRt()).isEqualTo("2+");
        assertThat(result.getCausesOfSymptoms()).containsExactlyInAnyOrder(SymptomCause.FOOD, SymptomCause.POSTURE);
        assertThat(result.getCauseOfSymptomsOther()).isEqualTo("Lift heavy box");
        assertThat(entity.getHealthProfile()).isEqualTo(healthProfile);
        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.COMPLETED);
        verify(recordTreatmentRepository).save(entity);
    }

    @Test
    void getLatestHealthProfileByPatientId_shouldReturnMappedHealthProfile() {
        RecordTreatment rt = new RecordTreatment();
        rt.setRecordTreatmentId(99);
        rt.setHealthProfile(healthProfile);

        HealthProfileResponseDTO hpResponse = HealthProfileResponseDTO.builder()
                .healthId(5)
                .drugAllergy("Penicillin")
                .underlyingDisease("Diabetes")
                .build();

        when(recordTreatmentRepository
                .findFirstByAppointment_Patient_PatientIdAndHealthProfileIsNotNullOrderByRecordDateDescRecordTreatmentIdDesc(10))
                .thenReturn(Optional.of(rt));
        when(healthProfileMapper.toResponseDTO(healthProfile)).thenReturn(hpResponse);

        HealthProfileResponseDTO result = recordTreatmentService.getLatestHealthProfileByPatientId(10);

        assertThat(result).isNotNull();
        assertThat(result.getDrugAllergy()).isEqualTo("Penicillin");
        assertThat(result.getUnderlyingDisease()).isEqualTo("Diabetes");
    }

    @Test
    void update_whenReceiptIssued_shouldPreserveOriginalRecordDateAndAllowClinicalUpdates() {
        Date originalDate = new Date(1700000000000L);
        Date attemptedNewDate = new Date(1705000000000L);

        RecordTreatment existing = new RecordTreatment();
        existing.setRecordTreatmentId(50);
        existing.setRecordDate(originalDate);
        existing.setSymptoms("Old Symptoms");
        existing.setAppointment(appointment);

        RecordTreatmentRequestDTO updateDto = RecordTreatmentRequestDTO.builder()
                .doctorId(1)
                .recordDate(attemptedNewDate)
                .symptoms("Updated Clinical Notes")
                .suggestions("Rest and stretch")
                .build();

        Receipt receipt = new Receipt();
        receipt.setReceiptId(101);

        when(recordTreatmentRepository.findById(50)).thenReturn(Optional.of(existing));
        when(receiptRepository.findByRecordTreatment_RecordTreatmentId(50)).thenReturn(Optional.of(receipt));
        doAnswer(invocation -> {
            RecordTreatmentRequestDTO dtoArg = invocation.getArgument(0);
            RecordTreatment target = invocation.getArgument(1);
            target.setRecordDate(dtoArg.getRecordDate());
            target.setSymptoms(dtoArg.getSymptoms());
            target.setSuggestions(dtoArg.getSuggestions());
            return null;
        }).when(recordTreatmentMapper).updateEntityFromDto(updateDto, existing);

        when(recordTreatmentRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        RecordTreatmentResponseDTO responseDTO = RecordTreatmentResponseDTO.builder()
                .recordTreatmentId(50)
                .symptoms("Updated Clinical Notes")
                .suggestions("Rest and stretch")
                .build();
        when(recordTreatmentMapper.toResponseDTO(existing)).thenReturn(responseDTO);

        RecordTreatmentResponseDTO result = recordTreatmentService.update(50, updateDto);

        assertThat(result).isNotNull();
        assertThat(result.getSymptoms()).isEqualTo("Updated Clinical Notes");
        assertThat(result.getSuggestions()).isEqualTo("Rest and stretch");
        // Verify recordDate remained the original date because receipt was present
        assertThat(existing.getRecordDate()).isEqualTo(originalDate);
        verify(recordTreatmentRepository).save(existing);
    }

    @Test
    void update_whenNoReceipt_shouldAllowDateAndClinicalUpdates() {
        Date originalDate = new Date(1700000000000L);
        Date attemptedNewDate = new Date(1705000000000L);

        RecordTreatment existing = new RecordTreatment();
        existing.setRecordTreatmentId(51);
        existing.setRecordDate(originalDate);
        existing.setSymptoms("Old Symptoms");
        existing.setAppointment(appointment);

        RecordTreatmentRequestDTO updateDto = RecordTreatmentRequestDTO.builder()
                .doctorId(1)
                .recordDate(attemptedNewDate)
                .symptoms("Updated Clinical Notes")
                .build();

        when(recordTreatmentRepository.findById(51)).thenReturn(Optional.of(existing));
        when(receiptRepository.findByRecordTreatment_RecordTreatmentId(51)).thenReturn(Optional.empty());
        doAnswer(invocation -> {
            RecordTreatmentRequestDTO dtoArg = invocation.getArgument(0);
            RecordTreatment target = invocation.getArgument(1);
            target.setRecordDate(dtoArg.getRecordDate());
            target.setSymptoms(dtoArg.getSymptoms());
            return null;
        }).when(recordTreatmentMapper).updateEntityFromDto(updateDto, existing);

        when(recordTreatmentRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        RecordTreatmentResponseDTO responseDTO = RecordTreatmentResponseDTO.builder()
                .recordTreatmentId(51)
                .symptoms("Updated Clinical Notes")
                .build();
        when(recordTreatmentMapper.toResponseDTO(existing)).thenReturn(responseDTO);

        RecordTreatmentResponseDTO result = recordTreatmentService.update(51, updateDto);

        assertThat(result).isNotNull();
        // Since no receipt was present, new date is accepted
        assertThat(existing.getRecordDate()).isEqualTo(attemptedNewDate);
        verify(recordTreatmentRepository).save(existing);
    }

    @Test
    void create_walkIn_whenNoDoctorScheduleOnDate_shouldThrowBadRequestException() {
        Date recordDate = new Date();
        RecordTreatmentRequestDTO requestDTO = RecordTreatmentRequestDTO.builder()
                .patientId(10)
                .doctorId(1)
                .recordDate(recordDate)
                .symptoms("Cough")
                .build();

        when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(patientRepository.findById(10)).thenReturn(Optional.of(patient));
        when(workingScheduleRepository.findByDoctor_DoctorId(1)).thenReturn(java.util.Collections.emptyList());

        assertThatThrownBy(() -> recordTreatmentService.create(requestDTO))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("แพทย์ยังไม่มีตารางเวลาปฏิบัติงานในวันที่เลือก กรุณากำหนดตารางเวลาปฏิบัติงานก่อนบันทึกการรักษา");

        verifyNoInteractions(appointmentSlotRepository);
        verify(recordTreatmentRepository, never()).save(any());
    }

    @Test
    void create_walkIn_whenScheduleExists_butSlotIdMissing_shouldThrowBadRequestException() {
        Date recordDate = new Date();
        WorkingSchedule schedule = new WorkingSchedule();
        schedule.setScheduleId(1);
        schedule.setDate(recordDate);
        schedule.setDoctor(doctor);

        RecordTreatmentRequestDTO requestDTO = RecordTreatmentRequestDTO.builder()
                .patientId(10)
                .doctorId(1)
                .recordDate(recordDate)
                .symptoms("Cough")
                .slotId(null)
                .build();

        when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(patientRepository.findById(10)).thenReturn(Optional.of(patient));
        when(workingScheduleRepository.findByDoctor_DoctorId(1)).thenReturn(java.util.List.of(schedule));

        assertThatThrownBy(() -> recordTreatmentService.create(requestDTO))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("กรุณาระบุช่วงเวลาตรวจ (slotId) สำหรับผู้ป่วย Walk-in");

        verify(recordTreatmentRepository, never()).save(any());
    }

    @Test
    void create_walkIn_whenSlotBelongsToAnotherDoctor_shouldThrowBadRequestException() {
        Date recordDate = new Date();
        WorkingSchedule schedule = new WorkingSchedule();
        schedule.setScheduleId(1);
        schedule.setDate(recordDate);
        schedule.setDoctor(doctor);

        Doctor otherDoctor = new Doctor();
        otherDoctor.setDoctorId(2);

        WorkingSchedule otherSchedule = new WorkingSchedule();
        otherSchedule.setScheduleId(2);
        otherSchedule.setDate(recordDate);
        otherSchedule.setDoctor(otherDoctor);

        AppointmentSlot slot = new AppointmentSlot();
        slot.setSlotId(200);
        slot.setWorkingSchedule(otherSchedule);
        slot.setStatus(AppointmentSlotStatus.AVAILABLE);

        RecordTreatmentRequestDTO requestDTO = RecordTreatmentRequestDTO.builder()
                .patientId(10)
                .doctorId(1)
                .recordDate(recordDate)
                .symptoms("Cough")
                .slotId(200)
                .build();

        when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(patientRepository.findById(10)).thenReturn(Optional.of(patient));
        when(workingScheduleRepository.findByDoctor_DoctorId(1)).thenReturn(java.util.List.of(schedule));
        when(appointmentSlotRepository.findById(200)).thenReturn(Optional.of(slot));

        assertThatThrownBy(() -> recordTreatmentService.create(requestDTO))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("ช่วงเวลาที่เลือกไม่ใช่ของแพทย์ผู้ตรวจ");
    }

    @Test
    void create_walkIn_whenSlotAlreadyBooked_shouldThrowBadRequestException() {
        Date recordDate = new Date();
        WorkingSchedule schedule = new WorkingSchedule();
        schedule.setScheduleId(1);
        schedule.setDate(recordDate);
        schedule.setDoctor(doctor);

        Appointment existingApp = new Appointment();
        existingApp.setAppointmentId(999);

        AppointmentSlot slot = new AppointmentSlot();
        slot.setSlotId(200);
        slot.setWorkingSchedule(schedule);
        slot.setStatus(AppointmentSlotStatus.BOOKED);
        slot.setAppointment(existingApp);

        RecordTreatmentRequestDTO requestDTO = RecordTreatmentRequestDTO.builder()
                .patientId(10)
                .doctorId(1)
                .recordDate(recordDate)
                .symptoms("Cough")
                .slotId(200)
                .build();

        when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(patientRepository.findById(10)).thenReturn(Optional.of(patient));
        when(workingScheduleRepository.findByDoctor_DoctorId(1)).thenReturn(java.util.List.of(schedule));
        when(appointmentSlotRepository.findById(200)).thenReturn(Optional.of(slot));

        assertThatThrownBy(() -> recordTreatmentService.create(requestDTO))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("ช่วงเวลาที่เลือกมีนัดหมายอื่นอยู่แล้ว กรุณาเลือกช่วงเวลาอื่น");
    }

    @Test
    void create_walkIn_whenValidScheduleAndSlot_shouldCreateAppointmentAndRecordTreatment() {
        Date recordDate = new Date();
        WorkingSchedule schedule = new WorkingSchedule();
        schedule.setScheduleId(1);
        schedule.setDate(recordDate);
        schedule.setDoctor(doctor);

        AppointmentSlot slot = new AppointmentSlot();
        slot.setSlotId(200);
        slot.setWorkingSchedule(schedule);
        slot.setStatus(AppointmentSlotStatus.AVAILABLE);

        RecordTreatmentRequestDTO requestDTO = RecordTreatmentRequestDTO.builder()
                .patientId(10)
                .doctorId(1)
                .recordDate(recordDate)
                .symptoms("Cough and fever")
                .slotId(200)
                .build();

        RecordTreatment entity = new RecordTreatment();
        entity.setSymptoms("Cough and fever");

        when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));
        when(patientRepository.findById(10)).thenReturn(Optional.of(patient));
        when(workingScheduleRepository.findByDoctor_DoctorId(1)).thenReturn(java.util.List.of(schedule));
        when(appointmentSlotRepository.findById(200)).thenReturn(Optional.of(slot));
        when(appointmentSlotRepository.save(slot)).thenReturn(slot);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(recordTreatmentMapper.toEntity(requestDTO)).thenReturn(entity);
        when(recordTreatmentRepository.save(any(RecordTreatment.class))).thenAnswer(inv -> inv.getArgument(0));

        RecordTreatmentResponseDTO responseDTO = RecordTreatmentResponseDTO.builder()
                .recordTreatmentId(1)
                .symptoms("Cough and fever")
                .build();
        when(recordTreatmentMapper.toResponseDTO(any(RecordTreatment.class))).thenReturn(responseDTO);

        RecordTreatmentResponseDTO result = recordTreatmentService.create(requestDTO);

        assertThat(result).isNotNull();
        assertThat(slot.getStatus()).isEqualTo(AppointmentSlotStatus.BOOKED);
        verify(appointmentSlotRepository).save(slot);
        verify(appointmentRepository, atLeastOnce()).save(any(Appointment.class));
        verify(recordTreatmentRepository).save(entity);
    }
}
