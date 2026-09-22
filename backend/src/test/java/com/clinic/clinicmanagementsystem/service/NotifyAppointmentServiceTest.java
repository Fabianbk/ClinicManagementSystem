package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.NotifyAppointmentResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Appointment;
import com.clinic.clinicmanagementsystem.entity.AppointmentSlot;
import com.clinic.clinicmanagementsystem.entity.Doctor;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.entity.WorkingSchedule;
import com.clinic.clinicmanagementsystem.enums.AppointmentStatus;
import com.clinic.clinicmanagementsystem.repository.AppointmentRepository;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotifyAppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private CurrentUser currentUser;

    @InjectMocks
    private NotifyAppointmentService notifyAppointmentService;

    private Patient patient;
    private Doctor doctor;
    private WorkingSchedule schedule;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setPatientId(1);
        patient.setFullname("นาย สมศักดิ์ ใจดี");

        doctor = new Doctor();
        doctor.setDoctorId(10);
        doctor.setFullname("สมชาย พิมพ์ดี");

        schedule = new WorkingSchedule();
        schedule.setScheduleId(100);
        schedule.setDoctor(doctor);
    }

    private Appointment createAppointment(int id, AppointmentStatus status, Date start, Date end) {
        AppointmentSlot slot = new AppointmentSlot();
        slot.setSlotId(id * 10);
        slot.setStartTime(start);
        slot.setEndTime(end);
        slot.setWorkingSchedule(schedule);

        Appointment appointment = new Appointment();
        appointment.setAppointmentId(id);
        appointment.setStatus(status);
        appointment.setAppointmentSlot(slot);
        appointment.setPatient(patient);
        return appointment;
    }

    @Test
    @DisplayName("Should generate 3-day advance reminder with isUrgent=true when appointment is in 2 days")
    void shouldGenerate3DayAdvanceReminder() {
        int patientId = 1;
        long nowMs = System.currentTimeMillis();
        Date start = new Date(nowMs + (2L * 24 * 60 * 60 * 1000) + 3600000); // in ~2 days
        Date end = new Date(start.getTime() + 3600000);

        Appointment appointment = createAppointment(5, AppointmentStatus.SCHEDULED, start, end);

        when(appointmentRepository.findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeAsc(
                eq(patientId), eq(AppointmentStatus.SCHEDULED), any(Date.class)))
                .thenReturn(List.of(appointment));

        when(appointmentRepository.findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeDesc(
                eq(patientId), eq(AppointmentStatus.CANCELLED), any(Date.class)))
                .thenReturn(List.of());

        List<NotifyAppointmentResponseDTO> result = notifyAppointmentService.getUpcomingForPatient(patientId);

        verify(currentUser).requireSelfOrDoctor(patientId);
        assertThat(result).hasSize(1);

        NotifyAppointmentResponseDTO dto = result.get(0);
        assertThat(dto.getNotificationId()).isEqualTo("reminder-5");
        assertThat(dto.getNotificationType()).isEqualTo("REMINDER_3_DAYS");
        assertThat(dto.isUrgent()).isTrue();
        assertThat(dto.getTitle()).contains("เตือนนัดหมายตรวจรักษา");
        assertThat(dto.getMessage()).contains("พท. สมชาย พิมพ์ดี");
        assertThat(dto.getMessage()).contains("2 วัน");
    }

    @Test
    @DisplayName("Should generate general reminder with isUrgent=false when appointment is far in advance (> 3 days)")
    void shouldGenerateGeneralUpcomingReminder() {
        int patientId = 1;
        long nowMs = System.currentTimeMillis();
        Date start = new Date(nowMs + (10L * 24 * 60 * 60 * 1000)); // in 10 days
        Date end = new Date(start.getTime() + 3600000);

        Appointment appointment = createAppointment(6, AppointmentStatus.SCHEDULED, start, end);

        when(appointmentRepository.findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeAsc(
                eq(patientId), eq(AppointmentStatus.SCHEDULED), any(Date.class)))
                .thenReturn(List.of(appointment));

        when(appointmentRepository.findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeDesc(
                eq(patientId), eq(AppointmentStatus.CANCELLED), any(Date.class)))
                .thenReturn(List.of());

        List<NotifyAppointmentResponseDTO> result = notifyAppointmentService.getUpcomingForPatient(patientId);

        assertThat(result).hasSize(1);
        NotifyAppointmentResponseDTO dto = result.get(0);
        assertThat(dto.getNotificationId()).isEqualTo("reminder-6");
        assertThat(dto.getNotificationType()).isEqualTo("REMINDER_UPCOMING");
        assertThat(dto.isUrgent()).isFalse();
        assertThat(dto.getTitle()).isEqualTo("นัดหมายตรวจรักษาที่กำลังจะมาถึง");
    }

    @Test
    @DisplayName("Should generate cancellation notification with isUrgent=true when appointment was cancelled")
    void shouldGenerateCancellationNotification() {
        int patientId = 1;
        long nowMs = System.currentTimeMillis();
        Date start = new Date(nowMs + 86400000); // tomorrow
        Date end = new Date(start.getTime() + 3600000);

        Appointment cancelledAppointment = createAppointment(7, AppointmentStatus.CANCELLED, start, end);

        when(appointmentRepository.findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeAsc(
                eq(patientId), eq(AppointmentStatus.SCHEDULED), any(Date.class)))
                .thenReturn(List.of());

        when(appointmentRepository.findByPatient_PatientIdAndStatusAndAppointmentSlot_StartTimeAfterOrderByAppointmentSlot_StartTimeDesc(
                eq(patientId), eq(AppointmentStatus.CANCELLED), any(Date.class)))
                .thenReturn(List.of(cancelledAppointment));

        List<NotifyAppointmentResponseDTO> result = notifyAppointmentService.getUpcomingForPatient(patientId);

        assertThat(result).hasSize(1);
        NotifyAppointmentResponseDTO dto = result.get(0);
        assertThat(dto.getNotificationId()).isEqualTo("status-7-CANCELLED");
        assertThat(dto.getNotificationType()).isEqualTo("STATUS_CANCELLED");
        assertThat(dto.isUrgent()).isTrue();
        assertThat(dto.getTitle()).isEqualTo("การนัดหมายถูกยกเลิก");
        assertThat(dto.getMessage()).contains("ได้รับการยกเลิกแล้ว");
    }
}
