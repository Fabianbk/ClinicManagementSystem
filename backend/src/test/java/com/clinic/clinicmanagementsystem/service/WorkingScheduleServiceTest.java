package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.WorkingScheduleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.WorkingScheduleResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Doctor;
import com.clinic.clinicmanagementsystem.entity.WorkingSchedule;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.mapper.WorkingScheduleMapper;
import com.clinic.clinicmanagementsystem.repository.DoctorRepository;
import com.clinic.clinicmanagementsystem.repository.WorkingScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkingScheduleServiceTest {

    @Mock
    private WorkingScheduleRepository workingScheduleRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private WorkingScheduleMapper workingScheduleMapper;

    @InjectMocks
    private WorkingScheduleService workingScheduleService;

    private Doctor doctor;
    private Date futureDate;
    private Date shiftStart;
    private Date shiftEnd;

    @BeforeEach
    void setUp() {
        doctor = new Doctor();
        doctor.setDoctorId(1);
        doctor.setFullname("Dr. Somsak");

        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, 2);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        futureDate = cal.getTime();

        cal.set(Calendar.HOUR_OF_DAY, 9);
        shiftStart = cal.getTime();

        cal.set(Calendar.HOUR_OF_DAY, 16);
        shiftEnd = cal.getTime();
    }

    @Test
    void create_shouldThrowWhenShiftEndIsBeforeStart() {
        WorkingScheduleRequestDTO dto = WorkingScheduleRequestDTO.builder()
                .doctorId(1)
                .date(futureDate)
                .shiftStart(shiftEnd)
                .shiftEnd(shiftStart)
                .build();

        assertThatThrownBy(() -> workingScheduleService.create(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Shift end time must be after shift start time");
    }

    @Test
    void create_shouldThrowWhenDateIsInThePast() {
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -2);
        Date pastDate = cal.getTime();

        WorkingScheduleRequestDTO dto = WorkingScheduleRequestDTO.builder()
                .doctorId(1)
                .date(pastDate)
                .shiftStart(pastDate)
                .shiftEnd(new Date(pastDate.getTime() + 3600000))
                .build();

        assertThatThrownBy(() -> workingScheduleService.create(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot create or update schedule for past dates");
    }

    @Test
    void create_shouldThrowWhenScheduleOverlaps() {
        WorkingScheduleRequestDTO dto = WorkingScheduleRequestDTO.builder()
                .doctorId(1)
                .date(futureDate)
                .shiftStart(shiftStart)
                .shiftEnd(shiftEnd)
                .build();

        when(workingScheduleRepository.existsOverlappingSchedule(eq(1), eq(shiftStart), eq(shiftEnd), isNull()))
                .thenReturn(true);

        assertThatThrownBy(() -> workingScheduleService.create(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("overlapping working schedule");
    }

    @Test
    void create_shouldSucceedWhenValidAndNonOverlapping() {
        WorkingScheduleRequestDTO dto = WorkingScheduleRequestDTO.builder()
                .doctorId(1)
                .date(futureDate)
                .shiftStart(shiftStart)
                .shiftEnd(shiftEnd)
                .build();

        when(workingScheduleRepository.existsOverlappingSchedule(eq(1), eq(shiftStart), eq(shiftEnd), isNull()))
                .thenReturn(false);
        when(doctorRepository.findById(1)).thenReturn(Optional.of(doctor));

        WorkingSchedule schedule = new WorkingSchedule();
        schedule.setScheduleId(10);
        schedule.setDoctor(doctor);
        schedule.setDate(futureDate);
        schedule.setShiftStart(shiftStart);
        schedule.setShiftEnd(shiftEnd);

        when(workingScheduleMapper.toEntity(dto)).thenReturn(schedule);
        when(workingScheduleRepository.save(schedule)).thenReturn(schedule);

        WorkingScheduleResponseDTO responseDTO = WorkingScheduleResponseDTO.builder()
                .scheduleId(10)
                .doctorId(1)
                .doctorFullname("Dr. Somsak")
                .build();
        when(workingScheduleMapper.toResponseDTO(schedule)).thenReturn(responseDTO);

        WorkingScheduleResponseDTO result = workingScheduleService.create(dto);

        assertThat(result).isNotNull();
        assertThat(result.getScheduleId()).isEqualTo(10);
        verify(workingScheduleRepository).save(schedule);
    }

    @Test
    void update_shouldThrowWhenScheduleOverlaps() {
        WorkingSchedule existing = new WorkingSchedule();
        existing.setScheduleId(10);
        existing.setDoctor(doctor);

        when(workingScheduleRepository.findById(10)).thenReturn(Optional.of(existing));

        WorkingScheduleRequestDTO dto = WorkingScheduleRequestDTO.builder()
                .doctorId(1)
                .date(futureDate)
                .shiftStart(shiftStart)
                .shiftEnd(shiftEnd)
                .build();

        when(workingScheduleRepository.existsOverlappingSchedule(eq(1), eq(shiftStart), eq(shiftEnd), eq(10)))
                .thenReturn(true);

        assertThatThrownBy(() -> workingScheduleService.update(10, dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("overlapping working schedule");
    }

    private WorkingSchedule findScheduleOrThrow(int id) {
        WorkingSchedule ws = new WorkingSchedule();
        ws.setScheduleId(id);
        ws.setDoctor(doctor);
        return ws;
    }
}
