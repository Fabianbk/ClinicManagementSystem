package com.clinic.clinicmanagementsystem.service;

import com.deepoove.poi.XWPFTemplate;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class DocumentTemplateTest {

    @Test
    public void generateTestWordOutput() throws Exception {
        // หาไฟล์เทมเพลตที่ผู้ใช้แก้ไข
        File templateFile = new File("src/main/resources/templates/client_intake_form.docx");
        assertTrue(templateFile.exists(), "Template file not found!");

        // ข้อมูลจำลองสำหรับทดสอบ
        Map<String, Object> data = new HashMap<>();

        // ข้อมูลทั่วไป
        data.put("opdCardNo", "OPD-00123");
        data.put("patientName", "นายสมศักดิ์ รักษ์ดี");
        data.put("idCard", "1-1002-34567-89-0");
        data.put("occupation", "ข้าราชการบำนาญ");
        data.put("gender_male", "☑");
        data.put("gender_female", "☐");
        data.put("dobSolar", "15/08/2500");
        data.put("dobThai", "วันอังคาร ขึ้น ๑ ค่ำ เดือน ๙ ปีระกา");
        data.put("ageYears", "69");
        data.put("ageMonths", "0");
        data.put("ageDays", "19");

        // สถานภาพ
        data.put("status_single", "☐");
        data.put("status_relationship", "☐");
        data.put("status_married", "☑");
        data.put("status_widowed", "☐");
        data.put("status_separated", "☐");
        data.put("status_divorced", "☐");
        data.put("status_monk", "☐");

        // ที่อยู่ & ข้อมูลติดต่อ
        data.put("currentAddress", "123/45 หมู่ 3 ซอยสุขเกษม ถนนมิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000");
        data.put("birthPlace", "ขอนแก่น");
        data.put("province", "ขอนแก่น");
        data.put("phone", "081-234-5678");
        data.put("ethnicity", "ไทย");
        data.put("citizenship", "ไทย");
        data.put("religion", "พุทธ");

        // ธาตุเจ้าเรือน
        data.put("pd_earth", "☑");
        data.put("pd_water", "☐");
        data.put("pd_air", "☐");
        data.put("pd_fire", "☐");
        data.put("sd_earth", "☐");
        data.put("sd_water", "☑");
        data.put("sd_air", "☐");
        data.put("sd_fire", "☐");
        data.put("cd_earth", "☑");
        data.put("cd_water", "☐");
        data.put("cd_air", "☐");
        data.put("cd_fire", "☐");
        data.put("cc_semha", "☑");
        data.put("cc_vata", "☐");
        data.put("cc_pitta", "☐");
        data.put("so_semha", "☑");
        data.put("so_vata", "☐");
        data.put("so_pitta", "☐");
        data.put("sc_semha", "☐");
        data.put("sc_vata", "☑");
        data.put("sc_pitta", "☐");
        data.put("age_child", "☐");
        data.put("age_adult", "☐");
        data.put("age_aging", "☑");
        data.put("to_semha", "☑");
        data.put("to_vata", "☐");
        data.put("to_pitta", "☐");
        data.put("tc_semha", "☐");
        data.put("tc_vata", "☑");
        data.put("tc_pitta", "☐");
        data.put("gb_earth", "☑");
        data.put("gb_water", "☐");
        data.put("gb_air", "☐");
        data.put("gb_fire", "☐");
        data.put("gc_earth", "☑");
        data.put("gc_water", "☐");
        data.put("gc_air", "☐");
        data.put("gc_fire", "☐");

        // ประวัติสุขภาพ
        data.put("presentHistory", "มีอาการปวดตึงกล้ามเนื้อต้นคอบ่าไหล่ทั้งสองข้าง เป็นมาประมาณ 2 สัปดาห์");
        data.put("dis_deny", "☑");
        data.put("dis_have", "☐");
        data.put("diseaseDetail", "");
        data.put("drug_deny", "☑");
        data.put("drug_have", "☐");
        data.put("drugAllergyDetail", "");
        data.put("food_deny", "☑");
        data.put("food_have", "☐");
        data.put("foodAllergyDetail", "");
        data.put("fam_deny", "☑");
        data.put("fam_have", "☐");
        data.put("alcohol_deny", "☑");
        data.put("alcohol_have", "☐");
        data.put("smoke_deny", "☑");
        data.put("smoke_have", "☐");
        data.put("menstruationHistory", "-");

        // ตรวจร่างกาย & สัญญาณชีพ
        data.put("visitDate", "03/09/2569");
        data.put("visitTime", "14:30");
        data.put("symptoms", "ปวดเมื่อยคอบ่า สะบักจม หันศีรษะได้ไม่สุด");
        data.put("temp", "36.5");
        data.put("pulse", "76");
        data.put("respirationRate", "18");
        data.put("bp", "125/80");
        data.put("height", "168");
        data.put("weight", "65");
        data.put("bmi", "23.03");

        // Reflex
        data.put("bicepRt", "2+");
        data.put("bicepLt", "2+");
        data.put("tricepsRt", "2+");
        data.put("tricepsLt", "2+");
        data.put("kneeRt", "2+");
        data.put("kneeLt", "2+");
        data.put("ankleRt", "2+");
        data.put("ankleLt", "2+");

        // มูลเหตุเกิดโรค
        data.put("cause_food", "☐");
        data.put("cause_posture", "☑");
        data.put("cause_weather", "☐");
        data.put("cause_fasting", "☐");
        data.put("cause_suppress", "☐");
        data.put("cause_work", "☑");
        data.put("cause_sadness", "☐");
        data.put("cause_anger", "☐");
        data.put("cause_other", "");

        // การวินิจฉัย
        data.put("summaryOfSickness", "ลมปลายปัตฆาตสะบักจม");
        data.put("diagnosisElements", "วาโยธาตุพิการ กำเริบ");
        data.put("ttmDiagnosis", "โรคลมปลายปัตฆาต (U05.1)");
        data.put("modernDiagnosis", "Myofascial Pain Syndrome");

        // การรักษา
        data.put("treatmentPlan", "นวดรักษาทางการแพทย์แผนไทย ประคบสมุนไพร จ่ายยาสมุนไพร");
        data.put("treatmentProgram", "นวดราชสำนักแก้อาการ 1 ชั่วโมง ร่วมกับประคบสมุนไพรสด");
        data.put("suggestions", "หลีกเลี่ยงการก้มหน้าเล่นมือถือนาน ยืดเหยียดกล้ามเนื้อคอบ่าทุก 1 ชั่วโมง");
        data.put("followup", "อีก 1 สัปดาห์ (10/09/2569)");
        data.put("painScoreBefore", "7");
        data.put("painScoreAfter", "3");

        // แพทย์
        data.put("doctorName", "พท.พิมพ์วิมาน เบ็กเคอร์");
        data.put("doctorLicenseNo", "20173");

        // ตารางสั่งยา (หน้า 5)
        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> item1 = new HashMap<>();
        item1.put("name", "นวดรักษาทางการแพทย์แผนไทย (1 ชม.)");
        item1.put("price", "400.00");
        item1.put("qty", "1");
        item1.put("total", "400.00");
        items.add(item1);

        Map<String, Object> item2 = new HashMap<>();
        item2.put("name", "ลูกประคบสมุนไพรสด");
        item2.put("price", "150.00");
        item2.put("qty", "1");
        item2.put("total", "150.00");
        items.add(item2);

        Map<String, Object> item3 = new HashMap<>();
        item3.put("name", "ยาธรณีสัณฑะฆาต (แคปซูล)");
        item3.put("price", "120.00");
        item3.put("qty", "1");
        item3.put("total", "120.00");
        items.add(item3);

        data.put("items", items);
        data.put("grandTotal", "670.00");

        // สิทธิการรักษา
        data.put("pay_direct", "☑");
        data.put("pay_free", "☐");
        data.put("pay_special", "☐");
        data.put("pay_other", "☐");

        com.deepoove.poi.config.Configure config = com.deepoove.poi.config.Configure.builder()
                .bind("items", new com.deepoove.poi.plugin.table.LoopRowTableRenderPolicy("[", "]", true))
                .build();

        // ทำการ Render
        try (FileInputStream fis = new FileInputStream(templateFile);
                XWPFTemplate template = XWPFTemplate.compile(fis, config).render(data)) {

            File outputFile = new File("test_output.docx");
            try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                template.write(fos);
            }
            System.out.println("==================================================");
            System.out.println("สร้างไฟล์ทดสอบสำเร็จที่: " + outputFile.getAbsolutePath());
            System.out.println("==================================================");
        }
    }
}
