package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.AppointmentRequestDTO;
import com.clinic.clinicmanagementsystem.dto.AppointmentResponseDTO;
import com.clinic.clinicmanagementsystem.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "appointmentId", ignore = true)
    @Mapping(target = "appointmentSlot", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "recordTreatment", ignore = true)
    Appointment toEntity(AppointmentRequestDTO dto);

    @Mapping(target = "patientId", source = "patient.patientId")
    @Mapping(target = "patientFullname", source = "patient.fullname")
    @Mapping(target = "slotId", source = "appointmentSlot.slotId")
    @Mapping(target = "slotStartTime", source = "appointmentSlot.startTime")
    @Mapping(target = "slotEndTime", source = "appointmentSlot.endTime")
    @Mapping(target = "doctorId", source = "appointmentSlot.workingSchedule.doctor.doctorId")
    @Mapping(target = "doctorFullname", source = "appointmentSlot.workingSchedule.doctor.fullname")
    AppointmentResponseDTO toResponseDTO(Appointment entity);
}
