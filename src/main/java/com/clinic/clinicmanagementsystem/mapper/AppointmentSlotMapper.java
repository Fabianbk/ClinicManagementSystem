package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.AppointmentSlotRequestDTO;
import com.clinic.clinicmanagementsystem.dto.AppointmentSlotResponseDTO;
import com.clinic.clinicmanagementsystem.entity.AppointmentSlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentSlotMapper {

    @Mapping(target = "slotId", ignore = true)
    @Mapping(target = "workingSchedule", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    AppointmentSlot toEntity(AppointmentSlotRequestDTO dto);

    @Mapping(target = "scheduleId", source = "workingSchedule.scheduleId")
    @Mapping(target = "doctorId", source = "workingSchedule.doctor.doctorId")
    @Mapping(target = "doctorFullname", source = "workingSchedule.doctor.fullname")
    AppointmentSlotResponseDTO toResponseDTO(AppointmentSlot entity);
}
