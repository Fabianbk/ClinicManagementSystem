package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.dto.PatientRequestDTO;
import com.clinic.clinicmanagementsystem.dto.PatientResponseDTO;
import com.clinic.clinicmanagementsystem.entity.PatientAccount;
import com.clinic.clinicmanagementsystem.enums.BloodGroupAbo;
import com.clinic.clinicmanagementsystem.enums.BloodGroupRh;
import com.clinic.clinicmanagementsystem.enums.Gender;
import com.clinic.clinicmanagementsystem.enums.IdType;
import com.clinic.clinicmanagementsystem.enums.MaritalStatus;
import com.clinic.clinicmanagementsystem.enums.TreatmentRights;
import com.clinic.clinicmanagementsystem.repository.PatientAccountRepository;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class PatientServiceIntegrationTest {

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PatientAccountRepository patientAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void createPatient_persistsPatientAndPatientAccountSuccessfully() throws Exception {
        String testMobile = "0899999999";
        String testIdNumber = "9999999999999";
        Date testDob = new SimpleDateFormat("yyyy-MM-dd").parse("1998-05-20");

        PatientRequestDTO dto = PatientRequestDTO.builder()
                .fullname("Test Auto Account")
                .idType(IdType.THAI_ID)
                .nationalId(testIdNumber)
                .gender(Gender.FEMALE)
                .dateOfBirth(testDob)
                .occupation("Developer")
                .maritalStatus(MaritalStatus.SINGLE)
                .citizenship("Thai")
                .ethnicity("Thai")
                .religion("Buddhism")
                .bloodGroupAbo(BloodGroupAbo.B)
                .bloodGroupRh(BloodGroupRh.POSITIVE)
                .treatmentRights(TreatmentRights.PAY_DIRECT)
                .houseNo("456")
                .road("Test Street")
                .province("Bangkok")
                .mobileNumber(testMobile)
                .email("testauto@example.com")
                .build();

        PatientResponseDTO responseDTO = patientService.create(dto);

        assertThat(responseDTO).isNotNull();
        assertThat(responseDTO.getPatientId()).isGreaterThan(0);
        assertThat(responseDTO.getMobileNumber()).isEqualTo(testMobile);

        Optional<PatientAccount> accountOpt = patientAccountRepository.findById(testMobile);
        assertThat(accountOpt).isPresent();
        PatientAccount account = accountOpt.get();
        assertThat(account.getUsername()).isEqualTo(testMobile);
        assertThat(account.getPatient().getPatientId()).isEqualTo(responseDTO.getPatientId());
        assertThat(passwordEncoder.matches("20051998", account.getPassword())).isTrue();
    }
}
