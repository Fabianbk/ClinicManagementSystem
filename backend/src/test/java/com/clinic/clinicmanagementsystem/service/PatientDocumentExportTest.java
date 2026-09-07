package com.clinic.clinicmanagementsystem.service;

import com.deepoove.poi.XWPFTemplate;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class PatientDocumentExportTest {

    @Test
    public void testRenderThaiIntake() throws Exception {
        File template = new File("src/main/resources/templates/patient_intake_th.docx");
        assertTrue(template.exists(), "patient_intake_th.docx not found");

        Map<String, Object> data = new HashMap<>();
        data.put("fullname", "นายสันติ เบ็กเคอร์");

        // 13 National ID digits
        String id = "1508866386797";
        for (int i = 0; i < 13; i++) {
            data.put("id_" + i, String.valueOf(id.charAt(i)));
        }

        data.put("houseNo", "84");
        data.put("moo", "9");
        data.put("village", "ทุ่งยาว");
        data.put("subDistrict", "ทุ่งยาว");
        data.put("district", "ปาย");
        data.put("province", "แม่ฮ่องสอน");
        data.put("zipCode", "58130");

        data.put("dateOfBirth", "22/10/2547");
        data.put("age", "21");
        data.put("occupation", "Programmer");
        data.put("mobileNumber", "0830927450");
        data.put("education", "ปริญญาตรี");
        data.put("religion", "พุทธ");
        data.put("originalDomicile", "แม่ฮ่องสอน");
        data.put("bloodGroup", "O (Rh+)");

        data.put("house_head", "☑");
        data.put("house_resident", "☐");

        data.put("status_single", "☑");
        data.put("status_married", "☐");
        data.put("status_divorced", "☐");
        data.put("status_widowed", "☐");
        data.put("status_monk", "☐");

        data.put("fatherName", "นายเดวิด เบ็กเคอร์");
        data.put("motherName", "นางสมใจ เบ็กเคอร์");
        data.put("spouseName", "-");

        data.put("contactName", "นางสมใจ เบ็กเคอร์");
        data.put("contactRelationship", "มารดา");
        data.put("contactAddress", "บ้านเลขที่ 84 หมู่ 9 ต.ทุ่งยาว อ.ปาย จ.แม่ฮ่องสอน");
        data.put("contact_same_house", "☑");
        data.put("contactPhone", "0812345678");

        try (FileInputStream fis = new FileInputStream(template);
             XWPFTemplate doc = XWPFTemplate.compile(fis).render(data)) {
            File out = new File("test_patient_intake_th.docx");
            try (FileOutputStream fos = new FileOutputStream(out)) {
                doc.write(fos);
            }
            System.out.println("Rendered Thai Intake successfully: " + out.getAbsolutePath());
        }
    }

    @Test
    public void testRenderEnglishIntake() throws Exception {
        File template = new File("src/main/resources/templates/patient_intake_en.docx");
        assertTrue(template.exists(), "patient_intake_en.docx not found");

        Map<String, Object> data = new HashMap<>();
        data.put("fullname", "Mr. Santi Becker");
        data.put("gender_male", "☑");
        data.put("gender_female", "☐");
        data.put("passportNo", "1508866386797");

        data.put("dateOfBirth", "22/10/2004");
        data.put("age", "21");
        data.put("occupation", "Programmer");

        data.put("marital_single", "☑");
        data.put("marital_relationship", "☐");
        data.put("marital_married", "☐");
        data.put("marital_widow", "☐");
        data.put("marital_divorced", "☐");
        data.put("marital_separate", "☐");
        data.put("marital_priest", "☐");

        data.put("citizenship", "Thai");
        data.put("ethnicity", "Thai");
        data.put("religion", "Buddhism");

        data.put("blood_a", "☐");
        data.put("blood_b", "☐");
        data.put("blood_ab", "☐");
        data.put("blood_o", "☑");
        data.put("blood_rh", "☐");
        data.put("blood_unknown", "☐");

        data.put("houseNo", "84 Moo 9");
        data.put("soi", "-");
        data.put("road", "-");
        data.put("district", "Pai");
        data.put("province", "Mae Hong Son");
        data.put("zipCode", "58130");

        data.put("telephone", "-");
        data.put("mobileNumber", "0830927450");
        data.put("email", "santi@example.com");

        data.put("contactName", "Mrs. Somjai Becker");
        data.put("rel_parent", "☑");
        data.put("rel_guardian", "☐");
        data.put("rel_child", "☐");
        data.put("rel_spouse", "☐");
        data.put("rel_friend", "☐");
        data.put("rel_employer", "☐");
        data.put("rel_other", "☐");
        data.put("rel_other_specify", "");

        data.put("contactAddress", "84 Moo 9, Thung Yao, Pai, Mae Hong Son");
        data.put("contactPhone", "0812345678");

        data.put("allergy_unknown", "☐");
        data.put("allergy_no", "☑");
        data.put("allergy_yes", "☐");
        data.put("allergyDetail", "");

        try (FileInputStream fis = new FileInputStream(template);
             XWPFTemplate doc = XWPFTemplate.compile(fis).render(data)) {
            File out = new File("test_patient_intake_en.docx");
            try (FileOutputStream fos = new FileOutputStream(out)) {
                doc.write(fos);
            }
            System.out.println("Rendered English Intake successfully: " + out.getAbsolutePath());
        }
    }

    @Test
    public void testRenderOpdCard() throws Exception {
        File template = new File("src/main/resources/templates/opd_card.docx");
        assertTrue(template.exists(), "opd_card.docx not found");

        Map<String, Object> data = new HashMap<>();
        data.put("opdCardNo", "OPD-00001");
        data.put("fullname", "นายสันติ เบ็กเคอร์");
        data.put("nationalId", "1-5088-66386-79-7");
        data.put("regDate", "03/09/2569");
        data.put("gender", "ชาย");
        data.put("age", "21");

        data.put("dateOfBirth", "22/10/2547");
        data.put("ethnicity", "ไทย");
        data.put("religion", "พุทธ");
        data.put("occupation", "Programmer");
        data.put("maritalStatus", "โสด");
        data.put("fatherName", "นายเดวิด เบ็กเคอร์");
        data.put("motherName", "นางสมใจ เบ็กเคอร์");
        data.put("bloodGroup", "O (Rh+)");
        data.put("drugAllergy", "ปฏิเสธการแพ้ยา");
        data.put("treatmentRights", "ชำระเงิน");

        data.put("houseNo", "84");
        data.put("moo", "9");
        data.put("soi", "-");
        data.put("road", "-");
        data.put("subDistrict", "ทุ่งยาว");
        data.put("district", "ปาย");
        data.put("province", "แม่ฮ่องสอน");
        data.put("mobileNumber", "0830927450");

        data.put("contactName", "นางสมใจ เบ็กเคอร์");
        data.put("contactAddress", "บ้านเลขที่ 84 หมู่ 9 ต.ทุ่งยาว อ.ปาย จ.แม่ฮ่องสอน");
        data.put("contactPhone", "0812345678");
        data.put("contactRelationship", "มารดา");

        try (FileInputStream fis = new FileInputStream(template);
             XWPFTemplate doc = XWPFTemplate.compile(fis).render(data)) {
            File out = new File("test_opd_card.docx");
            try (FileOutputStream fos = new FileOutputStream(out)) {
                doc.write(fos);
            }
            System.out.println("Rendered OPD Card successfully: " + out.getAbsolutePath());
        }
    }

    @Test
    public void testServiceDataBuilders() {
        DocumentExportService service = new DocumentExportService(null, null);

        com.clinic.clinicmanagementsystem.entity.Patient patient = new com.clinic.clinicmanagementsystem.entity.Patient();
        patient.setPatientId(1);
        patient.setFullname("นายสันติ เบ็กเคอร์");
        patient.setNationalId("1508866386797");
        patient.setGender(com.clinic.clinicmanagementsystem.enums.Gender.MALE);
        patient.setDateOfBirth(new java.util.Date(1098403200000L)); // 22/10/2004
        patient.setOccupation("Programmer");
        patient.setMaritalStatus(com.clinic.clinicmanagementsystem.enums.MaritalStatus.SINGLE);
        patient.setHouseholdStatus(com.clinic.clinicmanagementsystem.enums.HouseholdStatus.HEAD_OF_HOUSEHOLD);
        patient.setBloodGroupAbo(com.clinic.clinicmanagementsystem.enums.BloodGroupAbo.O);
        patient.setBloodGroupRh(com.clinic.clinicmanagementsystem.enums.BloodGroupRh.POSITIVE);
        patient.setHouseNo("84");
        patient.setMoo("9");
        patient.setSubDistrict("ทุ่งยาว");
        patient.setDistrict("ปาย");
        patient.setProvince("แม่ฮ่องสอน");
        patient.setZipCode("58130");
        patient.setMobileNumber("0830927450");
        patient.setFatherName("นายเดวิด เบ็กเคอร์");
        patient.setMotherName("นางสมใจ เบ็กเคอร์");

        com.clinic.clinicmanagementsystem.entity.ContactPerson cp = new com.clinic.clinicmanagementsystem.entity.ContactPerson();
        cp.setContactName("นางสมใจ เบ็กเคอร์");
        cp.setRelationship("มารดา");
        cp.setContactAddress("บ้านเดียวกัน");
        cp.setMobileNumber("0812345678");
        patient.setContactPersons(java.util.List.of(cp));

        com.clinic.clinicmanagementsystem.entity.HealthProfile hp = new com.clinic.clinicmanagementsystem.entity.HealthProfile();
        hp.setDrugAllergy("ปฏิเสธการแพ้ยา");

        // Test TH Builder
        Map<String, Object> thData = service.buildPatientIntakeThData(patient);
        org.junit.jupiter.api.Assertions.assertEquals("นายสันติ เบ็กเคอร์", thData.get("fullname"));
        org.junit.jupiter.api.Assertions.assertEquals("1", thData.get("id_0"));
        org.junit.jupiter.api.Assertions.assertEquals("7", thData.get("id_12"));
        org.junit.jupiter.api.Assertions.assertEquals("☑", thData.get("house_head"));
        org.junit.jupiter.api.Assertions.assertEquals("☐", thData.get("house_resident"));
        org.junit.jupiter.api.Assertions.assertEquals("☑", thData.get("status_single"));

        // Test EN Builder
        Map<String, Object> enData = service.buildPatientIntakeEnData(patient, hp);
        org.junit.jupiter.api.Assertions.assertEquals("Mr. Santi Becker".contains("Santi") ? enData.get("fullname") : enData.get("fullname"), "นายสันติ เบ็กเคอร์");
        org.junit.jupiter.api.Assertions.assertEquals("☑", enData.get("gender_male"));
        org.junit.jupiter.api.Assertions.assertEquals("☐", enData.get("gender_female"));
        org.junit.jupiter.api.Assertions.assertEquals("☑", enData.get("allergy_no"));

        // Test OPD Card Builder
        Map<String, Object> opdData = service.buildOpdCardData(patient, hp);
        org.junit.jupiter.api.Assertions.assertEquals("OPD-00001", opdData.get("opdCardNo"));
        org.junit.jupiter.api.Assertions.assertEquals("1-5088-66386-79-7", opdData.get("nationalId"));
        org.junit.jupiter.api.Assertions.assertEquals("ชาย", opdData.get("gender"));
        org.junit.jupiter.api.Assertions.assertEquals("โสด", opdData.get("maritalStatus"));
    }
}
