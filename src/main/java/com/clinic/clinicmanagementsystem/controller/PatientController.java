package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.entity.Patient;
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
@RequestMapping("/api/patients")
public class PatientController {

    private PatientService patientService;

    @GetMapping
    public ResponseEntity<List<Patient>> getAll() {
        return ResponseEntity.ok(patientService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

}
