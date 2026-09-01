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

import static org.assertj.core.api.Assertions.assertThat;
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
                .causesOfSymptoms(causes)
                .causeOfSymptomsOther("Lift heavy box")
                .healthProfile(hpDto)
                .build();

        RecordTreatment entity = new RecordTreatment();
        entity.setSymptoms("Back pain");
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
                .causesOfSymptoms(causes)
                .causeOfSymptomsOther("Lift heavy box")
                .build();
        when(recordTreatmentMapper.toResponseDTO(any(RecordTreatment.class))).thenReturn(expectedResponse);

        RecordTreatmentResponseDTO result = recordTreatmentService.create(requestDTO);

        assertThat(result).isNotNull();
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
}
