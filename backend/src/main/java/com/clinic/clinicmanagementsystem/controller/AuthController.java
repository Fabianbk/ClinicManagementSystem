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

import com.clinic.clinicmanagementsystem.dto.ChangePasswordRequestDTO;
import com.clinic.clinicmanagementsystem.security.CurrentUser;
import com.clinic.clinicmanagementsystem.service.PatientAccountService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final DoctorRepository doctorRepository;
    private final PatientAccountRepository patientAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PatientAccountService patientAccountService;
    private final CurrentUser currentUser;

    @PostMapping("/login/doctor")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> loginDoctor(@Valid @RequestBody LoginRequestDTO dto) {
        Doctor doctor = doctorRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(dto.getPassword(), doctor.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(doctor.getUsername(), "DOCTOR", doctor.getDoctorId(), doctor.getFullname());

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
        String loginId = dto.getUsername() != null ? dto.getUsername().trim() : "";
        Integer parsedPatientId = parsePatientId(loginId);

        java.util.List<PatientAccount> accounts = patientAccountRepository.findByLoginIdentifier(loginId, parsedPatientId);
        if (accounts.isEmpty()) {
            throw new BadCredentialsException("Invalid username or password");
        }

        PatientAccount account = accounts.get(0);

        if (!passwordEncoder.matches(dto.getPassword(), account.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(
                account.getUsername(), "PATIENT", account.getPatient().getPatientId(), account.getPatient().getFullname());

        return ResponseEntity.ok(ApiResponse.success(AuthResponseDTO.builder()
                .token(token)
                .role("PATIENT")
                .id(account.getPatient().getPatientId())
                .username(account.getUsername())
                .fullname(account.getPatient().getFullname())
                .build(), "Login successful"));
    }

    private Integer parsePatientId(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        String clean = query.trim();
        if (clean.toUpperCase().startsWith("P-")) {
            clean = clean.substring(2).trim();
        } else if (clean.toUpperCase().startsWith("HN")) {
            clean = clean.substring(2).trim();
            if (clean.startsWith("-")) {
                clean = clean.substring(1).trim();
            }
        }
        if (clean.startsWith("0") && clean.length() >= 9) {
            return null;
        }
        try {
            return Integer.parseInt(clean);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @PutMapping("/patient/change-password")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> changePatientPassword(
            @Valid @RequestBody ChangePasswordRequestDTO dto) {
        patientAccountService.changePassword(currentUser.id(), dto);
        return ResponseEntity.ok(ApiResponse.success(null, "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว"));
    }
}