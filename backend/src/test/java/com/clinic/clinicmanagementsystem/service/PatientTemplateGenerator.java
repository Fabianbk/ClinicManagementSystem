package com.clinic.clinicmanagementsystem.service;

import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;

import java.io.File;
import java.io.FileOutputStream;
import java.math.BigInteger;

public class PatientTemplateGenerator {

    private static final String FONT_FAMILY = "TH Sarabun New";
    private static final String SYMBOL_FONT = "Segoe UI Symbol";
    private static final int FONT_SIZE = 15;

    @org.junit.jupiter.api.Test
    public void generateAllTemplates() throws Exception {
        main(new String[]{});
    }

    public static void main(String[] args) throws Exception {
        File dir = new File("src/main/resources/templates");
        if (!dir.exists()) {
            dir.mkdirs();
        }

        generateThaiIntakeTemplate(new File(dir, "patient_intake_th.docx"));
        generateEnglishIntakeTemplate(new File(dir, "patient_intake_en.docx"));
        generateOpdCardTemplate(new File(dir, "opd_card.docx"));

        System.out.println("Generated all 3 templates successfully!");
    }

    // =========================================================================
    // 1. แบบกรอกประวัติผู้ป่วย (Thai Intake Form)
    // =========================================================================
    public static void generateThaiIntakeTemplate(File file) throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            setPageMargins(doc, 720, 720, 720, 720); // 0.5 inch margins

            // Title in Box
            createTitleBox(doc, "แบบกรอกประวัติผู้ป่วย", 18);

            addEmptyParagraph(doc, 8);

            // Line 1: ชื่อสกุล ... เลขที่บัตรประชาชน ...
            XWPFParagraph p1 = doc.createParagraph();
            setSpacing(p1, 0, 100, 260);
            addRun(p1, "ชื่อสกุล  ", true);
            addRun(p1, "{{fullname}}");
            addRun(p1, "              เลขที่บัตรประชาชน  ", true);

            // 13-box table for National ID (1-4-5-2-1)
            createNationalIdTable(doc);

            // Line 2: ที่อยู่
            XWPFParagraph p2 = doc.createParagraph();
            setSpacing(p2, 100, 100, 260);
            addRun(p2, "ที่อยู่เลขที่  ", true);
            addRun(p2, "{{houseNo}}");
            addRun(p2, "  หมู่  ", true);
            addRun(p2, "{{moo}}");
            addRun(p2, "  บ้าน  ", true);
            addRun(p2, "{{village}}");
            addRun(p2, "  ตำบล  ", true);
            addRun(p2, "{{subDistrict}}");
            addRun(p2, "  อำเภอ  ", true);
            addRun(p2, "{{district}}");

            // Line 3: จังหวัด ... วันเกิด ... อายุ
            XWPFParagraph p3 = doc.createParagraph();
            setSpacing(p3, 100, 100, 260);
            addRun(p3, "จังหวัด  ", true);
            addRun(p3, "{{province}}");
            addRun(p3, "  รหัสไปรษณีย์  ", true);
            addRun(p3, "{{zipCode}}");
            addRun(p3, "  วัน /เดือน /ปี เกิด  ", true);
            addRun(p3, "{{dateOfBirth}}");
            addRun(p3, "  อายุ  ", true);
            addRun(p3, "{{age}}");
            addRun(p3, "  ปี", true);

            // Line 4: อาชีพ ... เบอร์โทร ... วุฒิ ... ศาสนา
            XWPFParagraph p4 = doc.createParagraph();
            setSpacing(p4, 100, 100, 260);
            addRun(p4, "อาชีพ  ", true);
            addRun(p4, "{{occupation}}");
            addRun(p4, "  เบอร์โทร  ", true);
            addRun(p4, "{{mobileNumber}}");
            addRun(p4, "  วุฒิการศึกษา  ", true);
            addRun(p4, "{{education}}");
            addRun(p4, "  ศาสนา  ", true);
            addRun(p4, "{{religion}}");

            // Line 5: ภูมิลำเนาเดิม ... กรุ๊ปเลือด
            XWPFParagraph p5 = doc.createParagraph();
            setSpacing(p5, 100, 100, 260);
            addRun(p5, "ภูมิลำเนาเดิม  ", true);
            addRun(p5, "{{originalDomicile}}");
            addRun(p5, "  กรุ๊ปเลือด  ", true);
            addRun(p5, "{{bloodGroup}}");

            // Line 6: สถานะในครอบครัว & สถานภาพสมรส
            XWPFParagraph p6 = doc.createParagraph();
            setSpacing(p6, 120, 100, 260);
            addUnderlineRun(p6, "สถานะในครอบครัว", true);
            addRun(p6, "   ");
            addSymbolRun(p6, "{{house_head}}");
            addRun(p6, " เจ้าบ้าน   ");
            addSymbolRun(p6, "{{house_resident}}");
            addRun(p6, " ผู้อาศัย     ");
            addUnderlineRun(p6, "สถานภาพสมรส", true);
            addRun(p6, "   ");
            addSymbolRun(p6, "{{status_single}}");
            addRun(p6, " โสด   ");
            addSymbolRun(p6, "{{status_married}}");
            addRun(p6, " คู่   ");
            addSymbolRun(p6, "{{status_divorced}}");
            addRun(p6, " หย่า   ");
            addSymbolRun(p6, "{{status_widowed}}");
            addRun(p6, " หม้าย   ");
            addSymbolRun(p6, "{{status_monk}}");
            addRun(p6, " สมณะ");

            // Line 7: บิดา มารดา คู่สมรส
            XWPFParagraph p7 = doc.createParagraph();
            setSpacing(p7, 100, 100, 260);
            addRun(p7, "ชื่อบิดา  ", true);
            addRun(p7, "{{fatherName}}");
            addRun(p7, "     ชื่อมารดา  ", true);
            addRun(p7, "{{motherName}}");
            addRun(p7, "     คู่สมรสชื่อ  ", true);
            addRun(p7, "{{spouseName}}");

            // Line 8: ผู้ที่สามารถติดต่อได้
            XWPFParagraph p8 = doc.createParagraph();
            setSpacing(p8, 120, 100, 260);
            addUnderlineRun(p8, "ชื่อนามสกุลผู้ที่สามารถติดต่อ", true);
            addRun(p8, "  ");
            addRun(p8, "{{contactName}}");
            addRun(p8, "     เกี่ยวข้องเป็น  ", true);
            addRun(p8, "{{contactRelationship}}");

            // Line 9: ที่อยู่ผู้ติดต่อ
            XWPFParagraph p9 = doc.createParagraph();
            setSpacing(p9, 100, 160, 260);
            addRun(p9, "ที่อยู่  ", true);
            addRun(p9, "{{contactAddress}}");
            addRun(p9, "   หรือ   ");
            addSymbolRun(p9, "{{contact_same_house}}");
            addRun(p9, " บ้านเดียวกัน     เบอร์โทรศัพท์  ", true);
            addRun(p9, "{{contactPhone}}");

            // Horizontal line
            XWPFParagraph pLine = doc.createParagraph();
            setSpacing(pLine, 100, 0, 200);
            addRun(pLine, "-----------------------------------------------------------------------------------------------------------------------------------------");

            try (FileOutputStream fos = new FileOutputStream(file)) {
                doc.write(fos);
            }
        }
    }

    // =========================================================================
    // 2. Patient's Personal Data (English Intake Form)
    // =========================================================================
    public static void generateEnglishIntakeTemplate(File file) throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            setPageMargins(doc, 720, 720, 720, 720);

            // Title in Box
            createTitleBox(doc, "Patient’s Personal Data", 18);

            addEmptyParagraph(doc, 10);

            // Line 1: Name, Gender, Passport
            XWPFParagraph p1 = doc.createParagraph();
            setSpacing(p1, 0, 100, 260);
            addRun(p1, "Name ", true);
            addRun(p1, "{{fullname}}");
            addRun(p1, "   Gender  ", true);
            addSymbolRun(p1, "{{gender_male}}");
            addRun(p1, " Male  ");
            addSymbolRun(p1, "{{gender_female}}");
            addRun(p1, " Female   Passport Number / Expatriate ", true);
            addRun(p1, "{{passportNo}}");

            // Line 2: Date of Birth, Age, Year, Occupation
            XWPFParagraph p2 = doc.createParagraph();
            setSpacing(p2, 100, 100, 260);
            addRun(p2, "Date of Birth ", true);
            addRun(p2, "{{dateOfBirth}}");
            addRun(p2, "   Age ", true);
            addRun(p2, "{{age}}");
            addRun(p2, " Year   Occupation ", true);
            addRun(p2, "{{occupation}}");

            // Line 3: Marital
            XWPFParagraph p3 = doc.createParagraph();
            setSpacing(p3, 100, 100, 260);
            addRun(p3, "Marital   ", true);
            addSymbolRun(p3, "{{marital_single}}");
            addRun(p3, " Single     ");
            addSymbolRun(p3, "{{marital_relationship}}");
            addRun(p3, " in a relationship     ");
            addSymbolRun(p3, "{{marital_married}}");
            addRun(p3, " Married     ");
            addSymbolRun(p3, "{{marital_widow}}");
            addRun(p3, " Widow     ");
            addSymbolRun(p3, "{{marital_divorced}}");
            addRun(p3, " Divorced     ");
            addSymbolRun(p3, "{{marital_separate}}");
            addRun(p3, " Separate     ");
            addSymbolRun(p3, "{{marital_priest}}");
            addRun(p3, " Priest");

            // Line 4: Nationality, Ethnic, Religion
            XWPFParagraph p4 = doc.createParagraph();
            setSpacing(p4, 100, 100, 260);
            addRun(p4, "Nationality ", true);
            addRun(p4, "{{citizenship}}");
            addRun(p4, "   Ethnic ", true);
            addRun(p4, "{{ethnicity}}");
            addRun(p4, "   Religion ", true);
            addRun(p4, "{{religion}}");

            // Line 5: Blood Group
            XWPFParagraph p5 = doc.createParagraph();
            setSpacing(p5, 100, 100, 260);
            addRun(p5, "Blood Group   ", true);
            addSymbolRun(p5, "{{blood_a}}");
            addRun(p5, " A     ");
            addSymbolRun(p5, "{{blood_b}}");
            addRun(p5, " B     ");
            addSymbolRun(p5, "{{blood_ab}}");
            addRun(p5, " AB     ");
            addSymbolRun(p5, "{{blood_o}}");
            addRun(p5, " O     ");
            addSymbolRun(p5, "{{blood_rh}}");
            addRun(p5, " Rh     ");
            addSymbolRun(p5, "{{blood_unknown}}");
            addRun(p5, " Unknown");

            // Line 6: Address
            XWPFParagraph p6 = doc.createParagraph();
            setSpacing(p6, 100, 100, 260);
            addRun(p6, "Address (Address ID) ", true);
            addRun(p6, "{{houseNo}}");
            addRun(p6, "  Soi ", true);
            addRun(p6, "{{soi}}");
            addRun(p6, "  Road ", true);
            addRun(p6, "{{road}}");
            addRun(p6, "  District ", true);
            addRun(p6, "{{district}}");
            addRun(p6, "  Province ", true);
            addRun(p6, "{{province}}");

            // Line 7: Postal Code, Telephone, Mobile, Email
            XWPFParagraph p7 = doc.createParagraph();
            setSpacing(p7, 100, 100, 260);
            addRun(p7, "Postal Code ", true);
            addRun(p7, "{{zipCode}}");
            addRun(p7, "  Telephone ", true);
            addRun(p7, "{{telephone}}");
            addRun(p7, "  Mobile ", true);
            addRun(p7, "{{mobileNumber}}");
            addRun(p7, "  EMail ", true);
            addRun(p7, "{{email}}");

            // Line 8: Emergency Contact
            XWPFParagraph p8 = doc.createParagraph();
            setSpacing(p8, 120, 100, 260);
            addRun(p8, "Contact Person in case of Emergency (Please Specify) ", true);
            addRun(p8, "{{contactName}}");

            // Line 9: Relationship
            XWPFParagraph p9 = doc.createParagraph();
            setSpacing(p9, 100, 100, 260);
            addRun(p9, "Relationship  ", true);
            addSymbolRun(p9, "{{rel_parent}}");
            addRun(p9, " Father/Mother  ");
            addSymbolRun(p9, "{{rel_guardian}}");
            addRun(p9, " Guardian  ");
            addSymbolRun(p9, "{{rel_child}}");
            addRun(p9, " Child  ");
            addSymbolRun(p9, "{{rel_spouse}}");
            addRun(p9, " Spouse  ");
            addSymbolRun(p9, "{{rel_friend}}");
            addRun(p9, " Friend  ");
            addSymbolRun(p9, "{{rel_employer}}");
            addRun(p9, " Employer  ");
            addSymbolRun(p9, "{{rel_other}}");
            addRun(p9, " Others: {{rel_other_specify}}");

            // Line 10: Contract Address & Telephone
            XWPFParagraph p10 = doc.createParagraph();
            setSpacing(p10, 100, 100, 260);
            addRun(p10, "Contact Address ", true);
            addRun(p10, "{{contactAddress}}");
            addRun(p10, "   Telephone ", true);
            addRun(p10, "{{contactPhone}}");

            // Line 11: Drug Allergy
            XWPFParagraph p11 = doc.createParagraph();
            setSpacing(p11, 120, 100, 260);
            addRun(p11, "Drug Allergy   ", true);
            addSymbolRun(p11, "{{allergy_unknown}}");
            addRun(p11, " Unknown     ");
            addSymbolRun(p11, "{{allergy_no}}");
            addRun(p11, " No     ");
            addSymbolRun(p11, "{{allergy_yes}}");
            addRun(p11, " Yes ");
            addRun(p11, "{{allergyDetail}}");

            try (FileOutputStream fos = new FileOutputStream(file)) {
                doc.write(fos);
            }
        }
    }

    // =========================================================================
    // 3. เวชระเบียนผู้ป่วย (OPD Card)
    // =========================================================================
    public static void generateOpdCardTemplate(File file) throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            setPageMargins(doc, 720, 720, 720, 720);

            // Clinic Header
            XWPFParagraph pClinic = doc.createParagraph();
            pClinic.setAlignment(ParagraphAlignment.CENTER);
            setSpacing(pClinic, 0, 60, 240);
            XWPFRun rClinic = addRun(pClinic, "พิมพ์วิมาน คลินิกการแพทย์แผนไทย", true);
            rClinic.setFontSize(18);

            // Subheader: เวชระเบียนผู้ป่วย ......... เลขที่ {{opdCardNo}}
            XWPFParagraph pSub = doc.createParagraph();
            setSpacing(pSub, 60, 120, 240);
            XWPFRun rSubLeft = addRun(pSub, "เวชระเบียนผู้ป่วย", true);
            rSubLeft.setFontSize(16);
            addRun(pSub, "                                                                                 ");
            XWPFRun rSubRight = addRun(pSub, "เลขที่  ", true);
            rSubRight.setFontSize(16);
            XWPFRun rCardNo = addRun(pSub, "{{opdCardNo}}", true);
            rCardNo.setFontSize(16);

            // 2x2 Table Layout for OPD Card
            XWPFTable table = doc.createTable(2, 2);
            table.setWidth("100%");
            setTableBorders(table);

            // Set column widths (approx 50% / 50%)
            for (XWPFTableRow row : table.getRows()) {
                row.getCell(0).setWidth("5000");
                row.getCell(1).setWidth("5000");
            }

            // Cell (0, 0) - Top Left: ชื่อผู้ป่วย, เลขบัตร
            XWPFTableCell c00 = table.getRow(0).getCell(0);
            setCellMargins(c00, 120, 150, 120, 150);
            XWPFParagraph p00_1 = c00.getParagraphs().get(0);
            setSpacing(p00_1, 0, 40, 240);
            addRun(p00_1, "ชื่อผู้ป่วย", true);
            XWPFParagraph p00_2 = c00.addParagraph();
            setSpacing(p00_2, 0, 40, 240);
            addRun(p00_2, "{{fullname}}");
            XWPFParagraph p00_3 = c00.addParagraph();
            setSpacing(p00_3, 40, 0, 240);
            addRun(p00_3, "เลขประจำตัวประชาชน  ", true);
            addRun(p00_3, "{{nationalId}}");

            // Cell (0, 1) - Top Right: วันที่ทำบัตร, เพศ, อายุ
            XWPFTableCell c01 = table.getRow(0).getCell(1);
            setCellMargins(c01, 120, 150, 120, 150);
            XWPFParagraph p01_1 = c01.getParagraphs().get(0);
            setSpacing(p01_1, 0, 40, 240);
            addRun(p01_1, "วันที่ทำบัตร", true);
            XWPFParagraph p01_2 = c01.addParagraph();
            setSpacing(p01_2, 0, 40, 240);
            addRun(p01_2, "{{regDate}}");
            XWPFParagraph p01_3 = c01.addParagraph();
            setSpacing(p01_3, 40, 0, 240);
            addRun(p01_3, "เพศ  ", true);
            addRun(p01_3, "{{gender}}");
            addRun(p01_3, "         อายุ  ", true);
            addRun(p01_3, "{{age}}");
            addRun(p01_3, "  ปี", true);

            // Cell (1, 0) - Bottom Left: ประวัติส่วนตัว & สุขภาพ
            XWPFTableCell c10 = table.getRow(1).getCell(0);
            setCellMargins(c10, 120, 150, 120, 150);
            XWPFParagraph p10_1 = c10.getParagraphs().get(0);
            setSpacing(p10_1, 0, 40, 240);
            addUnderlineRun(p10_1, "ประวัติ:", true);
            XWPFParagraph p10_2 = c10.addParagraph();
            setSpacing(p10_2, 0, 40, 240);
            addRun(p10_2, "วันเกิด  ", true);
            addRun(p10_2, "{{dateOfBirth}}");
            XWPFParagraph p10_3 = c10.addParagraph();
            setSpacing(p10_3, 0, 40, 240);
            addRun(p10_3, "เชื้อชาติ  ", true);
            addRun(p10_3, "{{ethnicity}}");
            addRun(p10_3, "  ศาสนา  ", true);
            addRun(p10_3, "{{religion}}");
            addRun(p10_3, "  อาชีพ  ", true);
            addRun(p10_3, "{{occupation}}");
            XWPFParagraph p10_4 = c10.addParagraph();
            setSpacing(p10_4, 0, 40, 240);
            addRun(p10_4, "สถานภาพสมรส  ", true);
            addRun(p10_4, "{{maritalStatus}}");
            XWPFParagraph p10_5 = c10.addParagraph();
            setSpacing(p10_5, 0, 40, 240);
            addRun(p10_5, "ชื่อบิดา  ", true);
            addRun(p10_5, "{{fatherName}}");
            XWPFParagraph p10_6 = c10.addParagraph();
            setSpacing(p10_6, 0, 40, 240);
            addRun(p10_6, "ชื่อมารดา  ", true);
            addRun(p10_6, "{{motherName}}");
            XWPFParagraph p10_7 = c10.addParagraph();
            setSpacing(p10_7, 0, 40, 240);
            addRun(p10_7, "หมู่เลือด  ", true);
            addRun(p10_7, "{{bloodGroup}}");
            XWPFParagraph p10_8 = c10.addParagraph();
            setSpacing(p10_8, 0, 40, 240);
            addRun(p10_8, "แพ้ยา  ", true);
            addRun(p10_8, "{{drugAllergy}}");
            XWPFParagraph p10_9 = c10.addParagraph();
            setSpacing(p10_9, 0, 0, 240);
            addRun(p10_9, "สิทธิการรักษา  ", true);
            addRun(p10_9, "{{treatmentRights}}");

            // Cell (1, 1) - Bottom Right: ที่อยู่ & ผู้ติดต่อ
            XWPFTableCell c11 = table.getRow(1).getCell(1);
            setCellMargins(c11, 120, 150, 120, 150);
            XWPFParagraph p11_1 = c11.getParagraphs().get(0);
            setSpacing(p11_1, 0, 40, 240);
            addRun(p11_1, "ที่อยู่  บ้านเลขที่  ", true);
            addRun(p11_1, "{{houseNo}}");
            addRun(p11_1, "  หมู่ที่  ", true);
            addRun(p11_1, "{{moo}}");
            XWPFParagraph p11_2 = c11.addParagraph();
            setSpacing(p11_2, 0, 40, 240);
            addRun(p11_2, "        ซอย  ", true);
            addRun(p11_2, "{{soi}}");
            addRun(p11_2, "  ถนน  ", true);
            addRun(p11_2, "{{road}}");
            XWPFParagraph p11_3 = c11.addParagraph();
            setSpacing(p11_3, 0, 40, 240);
            addRun(p11_3, "        ตำบล  ", true);
            addRun(p11_3, "{{subDistrict}}");
            addRun(p11_3, "  อำเภอ  ", true);
            addRun(p11_3, "{{district}}");
            XWPFParagraph p11_4 = c11.addParagraph();
            setSpacing(p11_4, 0, 40, 240);
            addRun(p11_4, "        จังหวัด  ", true);
            addRun(p11_4, "{{province}}");
            XWPFParagraph p11_5 = c11.addParagraph();
            setSpacing(p11_5, 0, 80, 240);
            addRun(p11_5, "        โทร  ", true);
            addRun(p11_5, "{{mobileNumber}}");
            XWPFParagraph p11_6 = c11.addParagraph();
            setSpacing(p11_6, 40, 40, 240);
            addUnderlineRun(p11_6, "ผู้ติดต่อได้:", true);
            XWPFParagraph p11_7 = c11.addParagraph();
            setSpacing(p11_7, 0, 40, 240);
            addRun(p11_7, "        ชื่อ  ", true);
            addRun(p11_7, "{{contactName}}");
            XWPFParagraph p11_8 = c11.addParagraph();
            setSpacing(p11_8, 0, 40, 240);
            addRun(p11_8, "        ที่อยู่  ", true);
            addRun(p11_8, "{{contactAddress}}");
            XWPFParagraph p11_9 = c11.addParagraph();
            setSpacing(p11_9, 0, 0, 240);
            addRun(p11_9, "        โทร  ", true);
            addRun(p11_9, "{{contactPhone}}");
            addRun(p11_9, "  เกี่ยวข้องเป็น  ", true);
            addRun(p11_9, "{{contactRelationship}}");

            try (FileOutputStream fos = new FileOutputStream(file)) {
                doc.write(fos);
            }
        }
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    private static void createTitleBox(XWPFDocument doc, String titleText, int fontSize) {
        XWPFTable boxTable = doc.createTable(1, 1);
        boxTable.setWidth("4000"); // around 2.5 inches
        setTableBorders(boxTable);

        // Center table
        boxTable.setTableAlignment(TableRowAlign.CENTER);

        XWPFTableCell cell = boxTable.getRow(0).getCell(0);
        cell.setWidth("4000");
        setCellMargins(cell, 100, 200, 100, 200);

        XWPFParagraph p = cell.getParagraphs().get(0);
        p.setAlignment(ParagraphAlignment.CENTER);
        setSpacing(p, 0, 0, 240);

        XWPFRun r = p.createRun();
        r.setText(titleText);
        r.setBold(true);
        r.setFontFamily(FONT_FAMILY);
        r.setFontSize(fontSize);
    }

    private static void createNationalIdTable(XWPFDocument doc) {
        // 17 cells: 13 digits + 4 dash separators: 1 - 4 - 5 - 2 - 1
        XWPFTable table = doc.createTable(1, 17);
        table.setTableAlignment(TableRowAlign.CENTER);

        // Pattern: [0] - [1][2][3][4] - [5][6][7][8][9] - [10][11] - [12]
        // Cell indices:
        // 0 -> id_0
        // 1 -> dash
        // 2..5 -> id_1..id_4
        // 6 -> dash
        // 7..11 -> id_5..id_9
        // 12 -> dash
        // 13..14 -> id_10..id_11
        // 15 -> dash
        // 16 -> id_12
        int idIdx = 0;
        for (int c = 0; c < 17; c++) {
            XWPFTableCell cell = table.getRow(0).getCell(c);
            XWPFParagraph p = cell.getParagraphs().get(0);
            p.setAlignment(ParagraphAlignment.CENTER);
            setSpacing(p, 0, 0, 200);

            if (c == 1 || c == 6 || c == 12 || c == 15) {
                // Dash separator
                cell.setWidth("150");
                removeCellBorders(cell);
                XWPFRun r = p.createRun();
                r.setText("-");
                r.setFontFamily(FONT_FAMILY);
                r.setFontSize(14);
            } else {
                // Digit box
                cell.setWidth("350");
                setCellSingleBorder(cell);
                XWPFRun r = p.createRun();
                r.setText("{{id_" + idIdx + "}}");
                r.setFontFamily(FONT_FAMILY);
                r.setFontSize(14);
                idIdx++;
            }
        }
    }

    private static void setCellSingleBorder(XWPFTableCell cell) {
        CTTcPr tcPr = cell.getCTTc().isSetTcPr() ? cell.getCTTc().getTcPr() : cell.getCTTc().addNewTcPr();
        CTTcBorders borders = tcPr.isSetTcBorders() ? tcPr.getTcBorders() : tcPr.addNewTcBorders();
        setBorderStyle(borders.addNewTop());
        setBorderStyle(borders.addNewBottom());
        setBorderStyle(borders.addNewLeft());
        setBorderStyle(borders.addNewRight());
    }

    private static void removeCellBorders(XWPFTableCell cell) {
        CTTcPr tcPr = cell.getCTTc().isSetTcPr() ? cell.getCTTc().getTcPr() : cell.getCTTc().addNewTcPr();
        CTTcBorders borders = tcPr.isSetTcBorders() ? tcPr.getTcBorders() : tcPr.addNewTcBorders();
        borders.addNewTop().setVal(STBorder.NONE);
        borders.addNewBottom().setVal(STBorder.NONE);
        borders.addNewLeft().setVal(STBorder.NONE);
        borders.addNewRight().setVal(STBorder.NONE);
    }

    private static void setBorderStyle(CTBorder border) {
        border.setVal(STBorder.SINGLE);
        border.setSz(BigInteger.valueOf(6)); // 0.75 pt
        border.setSpace(BigInteger.ZERO);
        border.setColor("000000");
    }

    private static void setTableBorders(XWPFTable table) {
        CTTblPr tblPr = table.getCTTbl().getTblPr();
        CTTblBorders borders = tblPr.isSetTblBorders() ? tblPr.getTblBorders() : tblPr.addNewTblBorders();
        setBorderStyle(borders.addNewTop());
        setBorderStyle(borders.addNewBottom());
        setBorderStyle(borders.addNewLeft());
        setBorderStyle(borders.addNewRight());
        setBorderStyle(borders.addNewInsideH());
        setBorderStyle(borders.addNewInsideV());
    }

    private static void setCellMargins(XWPFTableCell cell, int top, int left, int bottom, int right) {
        CTTcPr tcPr = cell.getCTTc().isSetTcPr() ? cell.getCTTc().getTcPr() : cell.getCTTc().addNewTcPr();
        CTTcMar tcMar = tcPr.isSetTcMar() ? tcPr.getTcMar() : tcPr.addNewTcMar();
        tcMar.addNewTop().setW(BigInteger.valueOf(top));
        tcMar.addNewLeft().setW(BigInteger.valueOf(left));
        tcMar.addNewBottom().setW(BigInteger.valueOf(bottom));
        tcMar.addNewRight().setW(BigInteger.valueOf(right));
    }

    private static void setPageMargins(XWPFDocument doc, int top, int right, int bottom, int left) {
        CTSectPr sectPr = doc.getDocument().getBody().isSetSectPr()
                ? doc.getDocument().getBody().getSectPr()
                : doc.getDocument().getBody().addNewSectPr();
        CTPageMar pageMar = sectPr.isSetPgMar() ? sectPr.getPgMar() : sectPr.addNewPgMar();
        pageMar.setTop(BigInteger.valueOf(top));
        pageMar.setRight(BigInteger.valueOf(right));
        pageMar.setBottom(BigInteger.valueOf(bottom));
        pageMar.setLeft(BigInteger.valueOf(left));
    }

    private static XWPFRun addRun(XWPFParagraph p, String text) {
        return addRun(p, text, false);
    }

    private static XWPFRun addRun(XWPFParagraph p, String text, boolean bold) {
        XWPFRun r = p.createRun();
        r.setText(text);
        r.setFontFamily(FONT_FAMILY);
        r.setFontSize(FONT_SIZE);
        r.setBold(bold);
        return r;
    }

    private static XWPFRun addUnderlineRun(XWPFParagraph p, String text, boolean bold) {
        XWPFRun r = p.createRun();
        r.setText(text);
        r.setFontFamily(FONT_FAMILY);
        r.setFontSize(FONT_SIZE);
        r.setBold(bold);
        r.setUnderline(UnderlinePatterns.SINGLE);
        return r;
    }

    private static XWPFRun addSymbolRun(XWPFParagraph p, String text) {
        XWPFRun r = p.createRun();
        r.setText(text);
        r.setFontFamily(SYMBOL_FONT);
        r.setFontSize(FONT_SIZE);
        return r;
    }

    private static void setSpacing(XWPFParagraph p, int before, int after, int lineRule) {
        p.setSpacingBefore(before);
        p.setSpacingAfter(after);
        p.setSpacingLineRule(LineSpacingRule.AUTO);
    }

    private static void addEmptyParagraph(XWPFDocument doc, int size) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(0);
        p.setSpacingAfter(0);
        XWPFRun r = p.createRun();
        r.setFontSize(size);
        r.setText("");
    }
}
