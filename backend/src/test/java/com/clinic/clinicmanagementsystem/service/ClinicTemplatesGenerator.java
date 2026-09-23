package com.clinic.clinicmanagementsystem.service;

import org.apache.poi.xwpf.usermodel.*;
import org.junit.jupiter.api.Test;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;

import java.io.File;
import java.io.FileOutputStream;
import java.math.BigInteger;

public class ClinicTemplatesGenerator {

    private static final String FONT_FAMILY = "TH Sarabun New";
    private static final String SYMBOL_FONT = "Segoe UI Symbol";
    private static final int FONT_SIZE = 15;

    @Test
    public void generateTemplates() throws Exception {
        File dir = new File("src/main/resources/templates");
        if (!dir.exists()) {
            dir.mkdirs();
        }

        generateTreatmentOrderTemplate(new File(dir, "treatment_order.docx"));
        generateContinuedIntakeTemplate(new File(dir, "client_intake_continued.docx"));

        System.out.println("Generated treatment_order.docx and client_intake_continued.docx successfully!");
    }

    // =========================================================================
    // 1. ใบสั่งการรักษา (Treatment Order & Billing - 1 Page)
    // =========================================================================
    public static void generateTreatmentOrderTemplate(File file) throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            setPageMargins(doc, 720, 720, 720, 720); // 0.5 inch margins

            // Title
            XWPFParagraph titleP = doc.createParagraph();
            titleP.setAlignment(ParagraphAlignment.CENTER);
            setSpacing(titleP, 0, 40, 240);
            XWPFRun rTitle = titleP.createRun();
            rTitle.setText("ใบสั่งการรักษา");
            rTitle.setBold(true);
            rTitle.setFontFamily(FONT_FAMILY);
            rTitle.setFontSize(18);

            // Subtitle Clinic Name
            XWPFParagraph subP = doc.createParagraph();
            subP.setAlignment(ParagraphAlignment.CENTER);
            setSpacing(subP, 0, 40, 240);
            XWPFRun rSub = subP.createRun();
            rSub.setText("ทางการแพทย์แผนไทย พิมพ์วิมาน คลินิกแพทย์แผนไทย");
            rSub.setBold(true);
            rSub.setFontFamily(FONT_FAMILY);
            rSub.setFontSize(16);

            // Phone
            XWPFParagraph phoneP = doc.createParagraph();
            phoneP.setAlignment(ParagraphAlignment.CENTER);
            setSpacing(phoneP, 0, 100, 240);
            XWPFRun rPhone = phoneP.createRun();
            rPhone.setText("081 – 9358026");
            rPhone.setFontFamily(FONT_FAMILY);
            rPhone.setFontSize(14);

            // Date (Right aligned)
            XWPFParagraph dateP = doc.createParagraph();
            dateP.setAlignment(ParagraphAlignment.RIGHT);
            setSpacing(dateP, 40, 60, 240);
            addRun(dateP, "วันที่  ", true);
            addRun(dateP, "{{visitDate}}");

            // Patient Info
            XWPFParagraph pInfo = doc.createParagraph();
            setSpacing(pInfo, 40, 60, 260);
            addRun(pInfo, "ชื่อ – สกุล  ", true);
            addRun(pInfo, "{{patientName}}");
            addRun(pInfo, "        อายุ  ", true);
            addRun(pInfo, "{{ageYears}}");
            addRun(pInfo, "  ปี        เลขที่บัตร  ", true);
            addRun(pInfo, "{{opdCardNo}}");

            // Treatment Rights
            XWPFParagraph pRights = doc.createParagraph();
            setSpacing(pRights, 40, 100, 260);
            addRun(pRights, "สิทธิการรักษา  ", true);
            addSymbolRun(pRights, "{{pay_direct}}");
            addRun(pRights, " ชำระเงิน     ");
            addSymbolRun(pRights, "{{pay_free}}");
            addRun(pRights, " ไม่ต้องชำระเงิน     ");
            addSymbolRun(pRights, "{{pay_special}}");
            addRun(pRights, " ผู้สูงอายุ , นักบวช , ผู้พิการ     ");
            addSymbolRun(pRights, "{{pay_other}}");
            addRun(pRights, " อื่นๆ");

            // Table of items (4 columns)
            // Width total ~ 9400 dxa (A4 width 11906 - 1440 margin = 10466)
            XWPFTable table = doc.createTable(2, 4);
            setTableBorders(table);
            table.setTableAlignment(TableRowAlign.CENTER);

            // Header row
            XWPFTableRow headerRow = table.getRow(0);
            headerRow.setRepeatHeader(true);
            setCell(headerRow.getCell(0), "รายการ", true, ParagraphAlignment.CENTER, 4800);
            setCell(headerRow.getCell(1), "ราคา\n(ต่อหน่วย)", true, ParagraphAlignment.CENTER, 1400);
            setCell(headerRow.getCell(2), "จำนวน", true, ParagraphAlignment.CENTER, 1200);
            setCell(headerRow.getCell(3), "ค่ารักษา (บาท)", true, ParagraphAlignment.CENTER, 2000);

            // Loop row for poi-tl
            XWPFTableRow dataRow = table.getRow(1);
            setCell(dataRow.getCell(0), "{{items}} [name]", false, ParagraphAlignment.LEFT, 4800);
            setCell(dataRow.getCell(1), "[price]", false, ParagraphAlignment.RIGHT, 1400);
            setCell(dataRow.getCell(2), "[qty]", false, ParagraphAlignment.CENTER, 1200);
            setCell(dataRow.getCell(3), "[total]", false, ParagraphAlignment.RIGHT, 2000);

            // Grand Total Row
            XWPFTableRow totalRow = table.createRow();
            setCell(totalRow.getCell(0), "รวมค่ารักษาทั้งสิ้น", true, ParagraphAlignment.RIGHT, 4800);
            setCell(totalRow.getCell(1), "", false, ParagraphAlignment.CENTER, 1400);
            setCell(totalRow.getCell(2), "", false, ParagraphAlignment.CENTER, 1200);
            setCell(totalRow.getCell(3), "{{grandTotal}} บาท", true, ParagraphAlignment.RIGHT, 2000);

            addEmptyParagraph(doc, 20);

            // Doctor Signatures
            XWPFParagraph pDoctor = doc.createParagraph();
            pDoctor.setAlignment(ParagraphAlignment.RIGHT);
            setSpacing(pDoctor, 80, 40, 260);
            addRun(pDoctor, "แพทย์แผนไทยผู้ตรวจ  ", true);
            addRun(pDoctor, "{{doctorName}}");

            XWPFParagraph pLicense = doc.createParagraph();
            pLicense.setAlignment(ParagraphAlignment.RIGHT);
            setSpacing(pLicense, 40, 40, 260);
            addRun(pLicense, "เลขที่ใบประกอบวิชาชีพ  ", true);
            addRun(pLicense, "{{doctorLicenseNo}}");

            try (FileOutputStream out = new FileOutputStream(file)) {
                doc.write(out);
            }
        }
    }

    // =========================================================================
    // 2. แบบบันทึกการรักษาต่อเนื่อง (Continued Treatment Record - 1 Page)
    // =========================================================================
    public static void generateContinuedIntakeTemplate(File file) throws Exception {
        try (XWPFDocument doc = new XWPFDocument()) {
            setPageMargins(doc, 580, 650, 580, 650); // Tight margins for 1-page fit

            // Title
            XWPFParagraph titleP = doc.createParagraph();
            titleP.setAlignment(ParagraphAlignment.CENTER);
            setSpacing(titleP, 0, 20, 220);
            XWPFRun rTitle = titleP.createRun();
            rTitle.setText("แบบบันทึกการรักษาต่อเนื่อง");
            rTitle.setBold(true);
            rTitle.setFontFamily(FONT_FAMILY);
            rTitle.setFontSize(17);

            XWPFParagraph subP = doc.createParagraph();
            subP.setAlignment(ParagraphAlignment.CENTER);
            setSpacing(subP, 0, 40, 220);
            XWPFRun rSub = subP.createRun();
            rSub.setText("พิมพ์วิมาน คลินิกแพทย์แผนไทย");
            rSub.setBold(true);
            rSub.setFontFamily(FONT_FAMILY);
            rSub.setFontSize(15);

            // Continued Page No & Date
            XWPFParagraph pHeader = doc.createParagraph();
            setSpacing(pHeader, 20, 40, 240);
            addRun(pHeader, "ส่วนต่อแผ่นที่ (Continued page No.)  ", true);
            addRun(pHeader, "{{continuedPageNo}}");
            addRun(pHeader, "                                     วันที่  ", true);
            addRun(pHeader, "{{visitDate}}");

            // Patient Info
            XWPFParagraph pPatient = doc.createParagraph();
            setSpacing(pPatient, 20, 40, 240);
            addRun(pPatient, "ชื่อ – สกุล  ", true);
            addRun(pPatient, "{{patientName}}");
            addRun(pPatient, "          อายุ  ", true);
            addRun(pPatient, "{{ageYears}}");
            addRun(pPatient, " ปี          เลขที่บัตร  ", true);
            addRun(pPatient, "{{opdCardNo}}");

            // Physical Examination
            XWPFParagraph pExamTitle = doc.createParagraph();
            setSpacing(pExamTitle, 40, 20, 240);
            addRun(pExamTitle, "การตรวจร่างกาย", true);

            XWPFParagraph pVitals1 = doc.createParagraph();
            setSpacing(pVitals1, 20, 20, 240);
            addRun(pVitals1, "น้ำหนัก  ");
            addRun(pVitals1, "{{weight}}", true);
            addRun(pVitals1, " กก.    อุณหภูมิ  ");
            addRun(pVitals1, "{{temp}}", true);
            addRun(pVitals1, " °C    ชีพจร  ");
            addRun(pVitals1, "{{pulse}}", true);
            addRun(pVitals1, " ครั้ง/นาที    อัตราการหายใจ  ");
            addRun(pVitals1, "{{respirationRate}}", true);
            addRun(pVitals1, " ครั้ง/นาที");

            XWPFParagraph pVitals2 = doc.createParagraph();
            setSpacing(pVitals2, 20, 40, 240);
            addRun(pVitals2, "ความดันโลหิต  ");
            addRun(pVitals2, "{{bp}}", true);
            addRun(pVitals2, " มม.ปรอท    ส่วนสูง  ");
            addRun(pVitals2, "{{height}}", true);
            addRun(pVitals2, " ซม.    ดัชนีมวลกาย (BMI)  ");
            addRun(pVitals2, "{{bmi}}", true);

            // Symptoms
            XWPFParagraph pSym = doc.createParagraph();
            setSpacing(pSym, 40, 40, 240);
            addRun(pSym, "อาการสำคัญ  ", true);
            addRun(pSym, "{{symptoms}}");

            // Reflexes & Pain
            XWPFParagraph pReflex = doc.createParagraph();
            setSpacing(pReflex, 20, 40, 240);
            addRun(pReflex, "Deep Tendon Reflexes (RT / LT):  ", true);
            addRun(pReflex, "Bicep: ");
            addRun(pReflex, "{{bicepRt}} / {{bicepLt}}");
            addRun(pReflex, "   Triceps: ");
            addRun(pReflex, "{{tricepsRt}} / {{tricepsLt}}");
            addRun(pReflex, "   Knee: ");
            addRun(pReflex, "{{kneeRt}} / {{kneeLt}}");
            addRun(pReflex, "   Ankle: ");
            addRun(pReflex, "{{ankleRt}} / {{ankleLt}}");

            XWPFParagraph pPain = doc.createParagraph();
            setSpacing(pPain, 20, 40, 240);
            addRun(pPain, "ระดับความปวด (Pain score):  ", true);
            addRun(pPain, "ก่อนการรักษา  ");
            addRun(pPain, "{{painScoreBefore}}", true);
            addRun(pPain, " / 10      หลังการรักษา  ");
            addRun(pPain, "{{painScoreAfter}}", true);
            addRun(pPain, " / 10");

            // Past & Personal History
            XWPFParagraph pHist1 = doc.createParagraph();
            setSpacing(pHist1, 40, 20, 240);
            addSymbolRun(pHist1, "{{dis_deny}}");
            addRun(pHist1, " ปฏิเสธโรคประจำตัว    ");
            addSymbolRun(pHist1, "{{dis_have}}");
            addRun(pHist1, " มีโรคประจำตัว: ");
            addRun(pHist1, "{{diseaseDetail}}");

            XWPFParagraph pHist2 = doc.createParagraph();
            setSpacing(pHist2, 20, 20, 240);
            addSymbolRun(pHist2, "{{drug_deny}}");
            addRun(pHist2, " ปฏิเสธการแพ้ยา    ");
            addSymbolRun(pHist2, "{{drug_have}}");
            addRun(pHist2, " แพ้ยา: ");
            addRun(pHist2, "{{drugAllergyDetail}}");

            XWPFParagraph pHist3 = doc.createParagraph();
            setSpacing(pHist3, 20, 20, 240);
            addSymbolRun(pHist3, "{{food_deny}}");
            addRun(pHist3, " ปฏิเสธการแพ้อาหาร    ");
            addSymbolRun(pHist3, "{{food_have}}");
            addRun(pHist3, " แพ้อาหาร: ");
            addRun(pHist3, "{{foodAllergyDetail}}");

            XWPFParagraph pHist4 = doc.createParagraph();
            setSpacing(pHist4, 20, 40, 240);
            addSymbolRun(pHist4, "{{alcohol_deny}}");
            addRun(pHist4, " ปฏิเสธการดื่มแอลกอฮอล์    ");
            addSymbolRun(pHist4, "{{alcohol_have}}");
            addRun(pHist4, " ดื่มแอลกอฮอล์        ");
            addSymbolRun(pHist4, "{{smoke_deny}}");
            addRun(pHist4, " ปฏิเสธการสูบบุหรี่    ");
            addSymbolRun(pHist4, "{{smoke_have}}");
            addRun(pHist4, " สูบบุหรี่");

            // Diagnosis
            XWPFParagraph pDiagTitle = doc.createParagraph();
            setSpacing(pDiagTitle, 40, 20, 240);
            addRun(pDiagTitle, "การวินิจฉัยโรค", true);

            XWPFParagraph pDiag1 = doc.createParagraph();
            setSpacing(pDiag1, 20, 20, 240);
            addRun(pDiag1, "สมุฏฐานธาตุพิการ:  ", true);
            addRun(pDiag1, "{{diagnosisElements}}");

            XWPFParagraph pDiag2 = doc.createParagraph();
            setSpacing(pDiag2, 20, 40, 240);
            addRun(pDiag2, "การวินิจฉัยโรคทางแพทย์แผนไทย/รหัสโรค:  ", true);
            addRun(pDiag2, "{{ttmDiagnosis}}");

            // Treatment Programs
            XWPFParagraph pTreatTitle = doc.createParagraph();
            setSpacing(pTreatTitle, 40, 20, 240);
            addRun(pTreatTitle, "การรักษา", true);

            XWPFParagraph pTreat1 = doc.createParagraph();
            setSpacing(pTreat1, 20, 20, 240);
            addSymbolRun(pTreat1, "{{prog_herbal_med}}");
            addRun(pTreat1, " จ่ายยาสมุนไพร        ");
            addSymbolRun(pTreat1, "{{prog_massage}}");
            addRun(pTreat1, " นวด/หัตถการ: ");
            addRun(pTreat1, "{{treatmentProgramMassageDetails}}");

            XWPFParagraph pTreat2 = doc.createParagraph();
            setSpacing(pTreat2, 20, 40, 240);
            addSymbolRun(pTreat2, "{{prog_compress}}");
            addRun(pTreat2, " ประคบสมุนไพร     ");
            addSymbolRun(pTreat2, "{{prog_steam}}");
            addRun(pTreat2, " อบสมุนไพร     ");
            addSymbolRun(pTreat2, "{{prog_consult}}");
            addRun(pTreat2, " ให้คำปรึกษาทางการแพทย์");

            // Follow-up
            XWPFParagraph pFollow = doc.createParagraph();
            setSpacing(pFollow, 30, 30, 240);
            addRun(pFollow, "นัดรักษาครั้งต่อไป:  ", true);
            addRun(pFollow, "{{followup}}");

            // Signature
            XWPFParagraph pSign = doc.createParagraph();
            setSpacing(pSign, 30, 0, 240);
            addRun(pSign, "แพทย์แผนไทยผู้ตรวจ:  ", true);
            addRun(pSign, "{{doctorName}}");
            addRun(pSign, "          เลขที่ใบประกอบโรคศิลปะ:  ", true);
            addRun(pSign, "{{doctorLicenseNo}}");

            try (FileOutputStream out = new FileOutputStream(file)) {
                doc.write(out);
            }
        }
    }

    // =========================================================================
    // Helpers
    // =========================================================================
    private static void setCell(XWPFTableCell cell, String text, boolean bold, ParagraphAlignment align, int widthDxa) {
        cell.setWidth(String.valueOf(widthDxa));
        setCellMargins(cell, 80, 100, 80, 100);
        XWPFParagraph p = cell.getParagraphs().get(0);
        p.setAlignment(align);
        setSpacing(p, 0, 0, 220);

        String[] lines = text.split("\n");
        for (int i = 0; i < lines.length; i++) {
            if (i > 0) {
                p = cell.addParagraph();
                p.setAlignment(align);
                setSpacing(p, 0, 0, 220);
            }
            XWPFRun r = p.createRun();
            r.setText(lines[i]);
            r.setBold(bold);
            r.setFontFamily(FONT_FAMILY);
            r.setFontSize(FONT_SIZE);
        }
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

    private static void setBorderStyle(CTBorder border) {
        border.setVal(STBorder.SINGLE);
        border.setSz(BigInteger.valueOf(6)); // 0.75 pt
        border.setSpace(BigInteger.ZERO);
        border.setColor("000000");
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
