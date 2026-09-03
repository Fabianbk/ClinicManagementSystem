package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.AppointmentRequestDTO;
import com.clinic.clinicmanagementsystem.dto.AppointmentResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Appointment;
import com.clinic.clinicmanagementsystem.entity.AppointmentSlot;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.enums.AppointmentSlotStatus;
import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.mapper.AppointmentMapper;
import com.clinic.clinicmanagementsystem.repository.AppointmentRepository;
import com.clinic.clinicmanagementsystem.repository.AppointmentSlotRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AppointmentSlotRepository appointmentSlotRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private AppointmentMapper appointmentMapper;

    @Mock
    private CurrentUser currentUser;

    @InjectMocks
    private AppointmentService appointmentService;

    private Patient patient;
    private AppointmentSlot slot;
    private Date futureStartTime;
    private Date futureEndTime;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setPatientId(10);
        patient.setFullname("Somchai");

        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, 1);
        cal.set(Calendar.HOUR_OF_DAY, 10);
        futureStartTime = cal.getTime();

        cal.set(Calendar.HOUR_OF_DAY, 11);
        futureEndTime = cal.getTime();

        slot = new AppointmentSlot();
        slot.setSlotId(100);
        slot.setStatus(AppointmentSlotStatus.AVAILABLE);
        slot.setStartTime(futureStartTime);
        slot.setEndTime(futureEndTime);
    }

    @Test
    void book_shouldThrowWhenSlotIsNotAvailable() {
        slot.setStatus(AppointmentSlotStatus.BOOKED);
        when(appointmentSlotRepository.findById(100)).thenReturn(Optional.of(slot));

        AppointmentRequestDTO dto = AppointmentRequestDTO.builder()
                .patientId(10)
                .slotId(100)
                .build();

        assertThatThrownBy(() -> appointmentService.book(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available for booking");
    }

    @Test
    void book_shouldThrowWhenSlotIsInThePast() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.HOUR_OF_DAY, -2);
        slot.setStartTime(cal.getTime());
        slot.setEndTime(new Date(cal.getTimeInMillis() + 3600000));

        when(appointmentSlotRepository.findById(100)).thenReturn(Optional.of(slot));

        AppointmentRequestDTO dto = AppointmentRequestDTO.builder()
                .patientId(10)
                .slotId(100)
                .build();

        assertThatThrownBy(() -> appointmentService.book(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot book an appointment slot in the past");
    }

    @Test
    void book_shouldThrowWhenPatientHasOverlappingAppointment() {
        when(appointmentSlotRepository.findById(100)).thenReturn(Optional.of(slot));
        when(patientRepository.findById(10)).thenReturn(Optional.of(patient));
        when(appointmentRepository.existsOverlappingAppointmentForPatient(
                eq(10), eq(AppointmentStatus.SCHEDULED), eq(futureStartTime), eq(futureEndTime)))
                .thenReturn(true);

        AppointmentRequestDTO dto = AppointmentRequestDTO.builder()
                .patientId(10)
                .slotId(100)
                .build();

        assertThatThrownBy(() -> appointmentService.book(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Patient already has an active scheduled appointment");
    }

    @Test
    void book_shouldSucceedWhenValid() {
        when(appointmentSlotRepository.findById(100)).thenReturn(Optional.of(slot));
        when(patientRepository.findById(10)).thenReturn(Optional.of(patient));
        when(appointmentRepository.existsOverlappingAppointmentForPatient(
                eq(10), eq(AppointmentStatus.SCHEDULED), eq(futureStartTime), eq(futureEndTime)))
                .thenReturn(false);

        Appointment savedAppointment = new Appointment();
        savedAppointment.setAppointmentId(500);
        savedAppointment.setAppointmentSlot(slot);
        savedAppointment.setPatient(patient);
        savedAppointment.setStatus(AppointmentStatus.SCHEDULED);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

        AppointmentResponseDTO responseDTO = AppointmentResponseDTO.builder()
                .appointmentId(500)
                .patientId(10)
                .slotId(100)
                .status(AppointmentStatus.SCHEDULED)
                .build();
        when(appointmentMapper.toResponseDTO(savedAppointment)).thenReturn(responseDTO);

        AppointmentRequestDTO dto = AppointmentRequestDTO.builder()
                .patientId(10)
                .slotId(100)
                .build();

        AppointmentResponseDTO result = appointmentService.book(dto);

        assertThat(result).isNotNull();
        assertThat(result.getAppointmentId()).isEqualTo(500);
        assertThat(slot.getStatus()).isEqualTo(AppointmentSlotStatus.BOOKED);
        verify(appointmentSlotRepository).save(slot);
        verify(appointmentRepository).save(any(Appointment.class));
    }
}
