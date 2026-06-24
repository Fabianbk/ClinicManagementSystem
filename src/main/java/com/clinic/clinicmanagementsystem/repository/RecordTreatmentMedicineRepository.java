package com.clinic.clinicmanagementsystem.repository;

import com.clinic.clinicmanagementsystem.entity.RecordTreatmentMedicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecordTreatmentMedicineRepository extends JpaRepository<RecordTreatmentMedicine, Integer> {
    List<RecordTreatmentMedicine> findByRecordTreatment_RecordTreatmentId(int recordTreatmentId);
}
