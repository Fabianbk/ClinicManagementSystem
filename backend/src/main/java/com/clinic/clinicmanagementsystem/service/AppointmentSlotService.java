package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.AppointmentSlotRequestDTO;
import com.clinic.clinicmanagementsystem.dto.AppointmentSlotResponseDTO;
import com.clinic.clinicmanagementsystem.entity.AppointmentSlot;
import com.clinic.clinicmanagementsystem.entity.WorkingSchedule;
import com.clinic.clinicmanagementsystem.enums.AppointmentSlotStatus;
import com.clinic.clinicmanagementsystem.exception.BadRequestException;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.mapper.AppointmentSlotMapper;
import com.clinic.clinicmanagementsystem.repository.AppointmentSlotRepository;
import com.clinic.clinicmanagementsystem.repository.WorkingScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentSlotService {

    private final AppointmentSlotRepository appointmentSlotRepository;
    private final WorkingScheduleRepository workingScheduleRepository;
    private final AppointmentSlotMapper appointmentSlotMapper;

    public AppointmentSlotResponseDTO create(AppointmentSlotRequestDTO dto) {
        if (dto.getEndTime().before(dto.getStartTime()) ||
                dto.getEndTime().equals(dto.getStartTime())) {
            throw new BadRequestException("Slot end time must be after slot start time");
        }

        WorkingSchedule schedule = workingScheduleRepository.findById(dto.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkingSchedule", dto.getScheduleId()));

        // Slot times must fall within the schedule's shift window
        if (dto.getStartTime().before(schedule.getShiftStart()) ||
                dto.getEndTime().after(schedule.getShiftEnd())) {
            throw new BadRequestException(
                    "Slot times must be within the schedule shift window ("
                    + schedule.getShiftStart() + " – " + schedule.getShiftEnd() + ")");
        }

        if (dto.getStartTime().before(new Date())) {
            throw new BadRequestException("Cannot create an appointment slot in the past");
        }

        AppointmentSlot slot = appointmentSlotMapper.toEntity(dto);
        slot.setWorkingSchedule(schedule);

        return appointmentSlotMapper.toResponseDTO(appointmentSlotRepository.save(slot));
    }

    @Transactional(readOnly = true)
    public AppointmentSlotResponseDTO getById(int slotId) {
        return appointmentSlotMapper.toResponseDTO(findSlotOrThrow(slotId));
    }

    /** All slots for a given schedule (any status). */
    @Transactional(readOnly = true)
    public List<AppointmentSlotResponseDTO> getByScheduleId(int scheduleId) {
        if (!workingScheduleRepository.existsById(scheduleId)) {
            throw new ResourceNotFoundException("WorkingSchedule", scheduleId);
        }
        return appointmentSlotRepository.findByWorkingSchedule_ScheduleId(scheduleId).stream()
                .map(appointmentSlotMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /** Only AVAILABLE slots for a given schedule — the list the booking UI shows to patients. */
    @Transactional(readOnly = true)
    public List<AppointmentSlotResponseDTO> getAvailableByScheduleId(int scheduleId) {
        if (!workingScheduleRepository.existsById(scheduleId)) {
            throw new ResourceNotFoundException("WorkingSchedule", scheduleId);
        }
        Date now = new Date();
        return appointmentSlotRepository
                .findByWorkingSchedule_ScheduleIdAndStatus(scheduleId, AppointmentSlotStatus.AVAILABLE)
                .stream()
                .filter(slot -> slot.getStartTime().after(now))
                .map(appointmentSlotMapper::toResponseDTO)
                .collect(Collectors.toList());
    }


    /**
     * Allows a doctor/admin to manually flip a slot between AVAILABLE and BLOCKED
     * (e.g. marking a break). Cannot be used to set a slot to BOOKED directly —
     * that only happens through AppointmentService#book, which also creates the
     * Appointment record atomically.
     */
    public AppointmentSlotResponseDTO updateStatus(int slotId, AppointmentSlotStatus newStatus) {
        if (newStatus == AppointmentSlotStatus.BOOKED) {
            throw new BadRequestException(
                    "Slots cannot be manually set to BOOKED — book an appointment instead");
        }

        AppointmentSlot slot = findSlotOrThrow(slotId);

        if (slot.getStatus() == AppointmentSlotStatus.BOOKED) {
            throw new BadRequestException(
                    "Cannot change status of a BOOKED slot — cancel the appointment first");
        }

        slot.setStatus(newStatus);
        return appointmentSlotMapper.toResponseDTO(appointmentSlotRepository.save(slot));
    }

    /**
     * Only AVAILABLE and BLOCKED slots can be deleted. A BOOKED slot has a live
     * Appointment pointing at it (FK nullable = false) so the DB will reject
     * the delete anyway — but we give a cleaner error message here.
     */
    public void delete(int slotId) {
        AppointmentSlot slot = findSlotOrThrow(slotId);

        if (slot.getStatus() == AppointmentSlotStatus.BOOKED) {
            throw new BadRequestException(
                    "Cannot delete a BOOKED slot — cancel the appointment first");
        }

        appointmentSlotRepository.delete(slot);
    }

    private AppointmentSlot findSlotOrThrow(int slotId) {
        return appointmentSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentSlot", slotId));
    }
}
