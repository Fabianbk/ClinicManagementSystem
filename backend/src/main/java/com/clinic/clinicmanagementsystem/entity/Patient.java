package com.clinic.clinicmanagementsystem.entity;

import com.clinic.clinicmanagementsystem.enums.BloodGroupAbo;
import com.clinic.clinicmanagementsystem.enums.BloodGroupRh;
import com.clinic.clinicmanagementsystem.enums.Gender;
import com.clinic.clinicmanagementsystem.enums.HouseholdStatus;
import com.clinic.clinicmanagementsystem.enums.IdType;
import com.clinic.clinicmanagementsystem.enums.MaritalStatus;
import com.clinic.clinicmanagementsystem.enums.TreatmentRights;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int patientId;

    @Column(name = "fullname", nullable = false, length = 255)
    private String fullname;

    @Column(name = "id_type", nullable = false, length = 20)
    private IdType idType = IdType.THAI_ID;

    @Column(name = "national_id", length = 13)
    private String nationalId;

    @Column(name = "passport_no", length = 15)
    private String passportNo;

    @Column(name = "gender", nullable = false, length = 10)
    private Gender gender;

    @Column(name = "date_of_birth", nullable = false)
    private Date dateOfBirth;

    @Column(name = "thai_calendar_birth_date", length = 100)
    private String thaiCalendarBirthDate;

    @Column(name = "occupation", length = 255)
    private String occupation;

    @Column(name = "marital_status", length = 50)
    private MaritalStatus maritalStatus = MaritalStatus.SINGLE;

    @Column(name = "citizenship", length = 100)
    private String citizenship = "Thai";

    @Column(name = "ethnicity", length = 100)
    private String ethnicity = "Thai";

    @Column(name = "religion", length = 100)
    private String religion;

    @Column(name = "blood_group_abo", length = 10)
    private BloodGroupAbo bloodGroupAbo = BloodGroupAbo.UNKNOWN;

    @Column(name = "blood_group_rh", length = 10)
    private BloodGroupRh bloodGroupRh = BloodGroupRh.UNKNOWN;

    @Column(name = "treatment_rights", length = 30)
    private TreatmentRights treatmentRights = TreatmentRights.PAY_DIRECT;

    // Structured Address
    @Column(name = "house_no", length = 50)
    private String houseNo;

    @Column(name = "moo", length = 50)
    private String moo;

    @Column(name = "soi", length = 100)
    private String soi;

    @Column(name = "road", length = 100)
    private String road;

    @Column(name = "sub_district", length = 100)
    private String subDistrict;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    // Thai-Specific Master Data (Nullable)
    @Column(name = "birth_place", length = 255)
    private String birthPlace;

    @Column(name = "original_domicile", length = 255)
    private String originalDomicile;

    @Column(name = "father_name", length = 255)
    private String fatherName;

    @Column(name = "mother_name", length = 255)
    private String motherName;

    @Column(name = "spouse_name", length = 255)
    private String spouseName;

    @Column(name = "household_status", length = 30)
    private HouseholdStatus householdStatus;

    @Column(name = "education", length = 100)
    private String education;

    // Contact
    @Column(name = "mobile_number", nullable = false, length = 20)
    private String mobileNumber;

    @Column(name = "email", length = 100)
    private String email;

    @OneToOne(cascade = CascadeType.ALL, mappedBy = "patient")
    private PatientAccount patientAccount;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "patient_id")
    private List<ContactPerson> contactPersons = new ArrayList<>();

    @OneToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE }, mappedBy = "patient")
    private List<Appointment> appointments;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "principle_principle_id")
    private DhatuPrinciple principle;

    /** Returns national ID if set, otherwise passport number. */
    public String getIdNumber() {
        if (nationalId != null && !nationalId.isBlank()) {
            return nationalId;
        }
        return passportNo;
    }

    /** Helper for single unified full address string matching official Thai standards. */
    public String getFullAddress() {
        boolean isBkk = province != null && (province.contains("กรุงเทพ") || province.equalsIgnoreCase("Bangkok") || province.equalsIgnoreCase("กทม") || province.equalsIgnoreCase("กทม."));

        String cleanHouseNo = null;
        if (houseNo != null && !houseNo.isBlank()) {
            String val = houseNo.trim();
            cleanHouseNo = (val.startsWith("บ้านเลขที่") || val.startsWith("เลขที่")) ? val : "บ้านเลขที่ " + val;
        }

        String cleanMoo = null;
        if (moo != null && !moo.isBlank()) {
            String val = moo.trim();
            cleanMoo = val.startsWith("หมู่") ? val : "หมู่ " + val;
        }

        String cleanSoi = null;
        if (soi != null && !soi.isBlank()) {
            String val = soi.trim();
            cleanSoi = val.startsWith("ซอย") ? val : "ซอย " + val;
        }

        String cleanRoad = null;
        if (road != null && !road.isBlank()) {
            String val = road.trim();
            cleanRoad = val.startsWith("ถนน") ? val : "ถนน " + val;
        }

        String cleanSubDistrict = null;
        if (subDistrict != null && !subDistrict.isBlank()) {
            String val = subDistrict.trim();
            if (isBkk) {
                cleanSubDistrict = val.startsWith("แขวง") ? val : "แขวง " + val.replaceFirst("^[ตต]ำบล\\s*", "").replaceFirst("^แขวง\\s*", "");
            } else {
                cleanSubDistrict = val.startsWith("ตำบล") ? val : "ตำบล " + val.replaceFirst("^แขวง\\s*", "").replaceFirst("^[ตต]ำบล\\s*", "");
            }
        }

        String cleanDistrict = null;
        if (district != null && !district.isBlank()) {
            String val = district.trim();
            if (isBkk) {
                cleanDistrict = val.startsWith("เขต") ? val : "เขต " + val.replaceFirst("^[ออ]ำเภอ\\s*", "").replaceFirst("^เขต\\s*", "");
            } else {
                cleanDistrict = val.startsWith("อำเภอ") ? val : "อำเภอ " + val.replaceFirst("^เขต\\s*", "").replaceFirst("^[ออ]ำเภอ\\s*", "");
            }
        }

        String cleanProvince = null;
        if (province != null && !province.isBlank()) {
            String val = province.trim();
            if (isBkk) {
                cleanProvince = "กรุงเทพมหานคร";
            } else {
                cleanProvince = val.startsWith("จังหวัด") ? val : "จังหวัด " + val;
            }
        }

        return Stream.of(
                cleanHouseNo,
                cleanMoo,
                cleanSoi,
                cleanRoad,
                cleanSubDistrict,
                cleanDistrict,
                cleanProvince,
                zipCode != null && !zipCode.isBlank() ? zipCode.trim() : null).filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(" "));
    }
}
