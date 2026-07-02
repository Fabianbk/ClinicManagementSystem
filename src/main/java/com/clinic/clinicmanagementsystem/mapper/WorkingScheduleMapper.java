package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.WorkingScheduleRequestDTO;
import com.clinic.clinicmanagementsystem.dto.WorkingScheduleResponseDTO;
import com.clinic.clinicmanagementsystem.entity.WorkingSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface WorkingScheduleMapper {

    @Mapping(target = "scheduleId", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "appointmentSlots", ignore = true)
    WorkingSchedule toEntity(WorkingScheduleRequestDTO dto);

    @Mapping(target = "doctorId", source = "doctor.doctorId")
    @Mapping(target = "doctorFullname", source = "doctor.fullname")
    WorkingScheduleResponseDTO toResponseDTO(WorkingSchedule entity);

    /** Updates date/shift fields in place — doctor reference is never changed via update. */
    @Mapping(target = "scheduleId", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "appointmentSlots", ignore = true)
    void updateEntityFromDto(WorkingScheduleRequestDTO dto, @MappingTarget WorkingSchedule entity);
}
