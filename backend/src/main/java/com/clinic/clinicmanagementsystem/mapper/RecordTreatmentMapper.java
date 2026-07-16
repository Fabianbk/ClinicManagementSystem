package com.clinic.clinicmanagementsystem.mapper;

import com.clinic.clinicmanagementsystem.dto.RecordTreatmentRequestDTO;
import com.clinic.clinicmanagementsystem.dto.RecordTreatmentResponseDTO;
import com.clinic.clinicmanagementsystem.entity.RecordTreatment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * recordTreatmentMedicines / receipt are mapped automatically via the
 * 'uses' mappers below since the field names match on both sides.
 */
@Mapper(
        componentModel = "spring",
        uses = {RecordTreatmentMedicineMapper.class, ReceiptMapper.class}
)
public interface RecordTreatmentMapper {

    @Mapping(target = "recordTreatmentId", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "recordTreatmentMedicines", ignore = true)
    @Mapping(target = "receipt", ignore = true)
    RecordTreatment toEntity(RecordTreatmentRequestDTO dto);

    @Mapping(target = "doctorId", source = "doctor.doctorId")
    @Mapping(target = "doctorFullname", source = "doctor.fullname")
    @Mapping(target = "appointmentId", source = "appointment.appointmentId")
    @Mapping(target = "patientId", source = "appointment.patient.patientId")
    @Mapping(target = "patientFullname", source = "appointment.patient.fullname")
    RecordTreatmentResponseDTO toResponseDTO(RecordTreatment entity);
}
