package com.clinic.clinicmanagementsystem.controller;

import com.clinic.clinicmanagementsystem.common.ApiResponse;
import com.clinic.clinicmanagementsystem.dto.AuthResponseDTO;
import com.clinic.clinicmanagementsystem.dto.LoginRequestDTO;
import com.clinic.clinicmanagementsystem.entity.Doctor;
import com.clinic.clinicmanagementsystem.entity.PatientAccount;
import com.clinic.clinicmanagementsystem.repository.DoctorRepository;
import com.clinic.clinicmanagementsystem.repository.PatientAccountRepository;
import com.clinic.clinicmanagementsystem.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final DoctorRepository doctorRepository;
    private final PatientAccountRepository patientAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login/doctor")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> loginDoctor(@Valid @RequestBody LoginRequestDTO dto) {
        Doctor doctor = doctorRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(dto.getPassword(), doctor.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(doctor.getUsername(), "DOCTOR", doctor.getDoctorId());

        return ResponseEntity.ok(ApiResponse.success(AuthResponseDTO.builder()
                .token(token)
                .role("DOCTOR")
                .id(doctor.getDoctorId())
                .username(doctor.getUsername())
                .fullname(doctor.getFullname())
                .build(), "Login successful"));
    }

    @PostMapping("/login/patient")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> loginPatient(@Valid @RequestBody LoginRequestDTO dto) {
        PatientAccount account = patientAccountRepository.findById(dto.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(dto.getPassword(), account.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(
                account.getUsername(), "PATIENT", account.getPatient().getPatientId());

        return ResponseEntity.ok(ApiResponse.success(AuthResponseDTO.builder()
                .token(token)
                .role("PATIENT")
                .id(account.getPatient().getPatientId())
                .username(account.getUsername())
                .fullname(account.getPatient().getFullname())
                .build(), "Login successful"));
    }
}