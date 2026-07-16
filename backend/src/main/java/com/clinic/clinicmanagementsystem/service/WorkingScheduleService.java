package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.WorkingScheduleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.WorkingScheduleResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Doctor;
import com.clinic.clinicmanagementsystem.entity.WorkingSchedule;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.WorkingScheduleMapper;
import com.clinic.clinicmanagementsystem.repository.DoctorRepository;
import com.clinic.clinicmanagementsystem.repository.WorkingScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkingScheduleService {

    private final WorkingScheduleRepository workingScheduleRepository;
    private final DoctorRepository doctorRepository;
    private final WorkingScheduleMapper workingScheduleMapper;

    public WorkingScheduleResponseDTO create(WorkingScheduleRequestDTO dto) {
        if (dto.getShiftEnd().before(dto.getShiftStart()) ||
                dto.getShiftEnd().equals(dto.getShiftStart())) {
            throw new BadRequestException("Shift end time must be after shift start time");
        }

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", dto.getDoctorId()));

        WorkingSchedule schedule = workingScheduleMapper.toEntity(dto);
        schedule.setDoctor(doctor);

        return workingScheduleMapper.toResponseDTO(workingScheduleRepository.save(schedule));
    }

    @Transactional(readOnly = true)
    public WorkingScheduleResponseDTO getById(int scheduleId) {
        return workingScheduleMapper.toResponseDTO(findScheduleOrThrow(scheduleId));
    }

    @Transactional(readOnly = true)
    public Page<WorkingScheduleResponseDTO> getAll(Pageable pageable) {
        return workingScheduleRepository.findAll(pageable)
                .map(workingScheduleMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<WorkingScheduleResponseDTO> getByDoctorId(int doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor", doctorId);
        }
        return workingScheduleRepository.findByDoctor_DoctorId(doctorId).stream()
                .map(workingScheduleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /** Updates date and shift times only — the assigned doctor never changes after creation. */
    public WorkingScheduleResponseDTO update(int scheduleId, WorkingScheduleRequestDTO dto) {
        if (dto.getShiftEnd().before(dto.getShiftStart()) ||
                dto.getShiftEnd().equals(dto.getShiftStart())) {
            throw new BadRequestException("Shift end time must be after shift start time");
        }

        WorkingSchedule existing = findScheduleOrThrow(scheduleId);
        workingScheduleMapper.updateEntityFromDto(dto, existing);
        return workingScheduleMapper.toResponseDTO(workingScheduleRepository.save(existing));
    }

    /**
     * Safe to delete only if no slots exist yet. WorkingSchedule.appointmentSlots
     * has orphanRemoval = true, so deleting the schedule cascades to AVAILABLE slots.
     * However, if any slot has been BOOKED, the cascade chain hits the FK on
     * Appointment.slot_id (nullable = false) and the DB rejects it — which is
     * exactly the behaviour we want: no accidental deletion of booked visits.
     */
    public void delete(int scheduleId) {
        WorkingSchedule existing = findScheduleOrThrow(scheduleId);
        workingScheduleRepository.delete(existing);
    }

    private WorkingSchedule findScheduleOrThrow(int scheduleId) {
        return workingScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkingSchedule", scheduleId));
    }
}
