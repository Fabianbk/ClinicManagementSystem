package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.entity.Doctor;
import com.clinic.clinicmanagementsystem.entity.Patient;
import com.clinic.clinicmanagementsystem.service.DoctorService;
import com.clinic.clinicmanagementsystem.service.PatientService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<Doctor>> getAll() {
        return ResponseEntity.ok(doctorService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(doctorService.findById(id));
    }
}
