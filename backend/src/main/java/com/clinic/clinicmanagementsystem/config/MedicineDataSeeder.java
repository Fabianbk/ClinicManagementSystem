package com.clinic.clinicmanagementsystem.config;

import com.clinic.clinicmanagementsystem.entity.Medicine;
import com.clinic.clinicmanagementsystem.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class MedicineDataSeeder implements CommandLineRunner {

    private final MedicineRepository medicineRepository;

    @Override
    public void run(String... args) {
        seedMedicines();
    }

    private void seedMedicines() {
        int seededCount = 0;

        // 1. ยาเม็ดแผนโบราณ
        seededCount += seedIfNotExists("ยาเม็ดดำบรรเทา ตราพระจันทร์", "ยาเม็ดแผนโบราณ", 48.0, "กล่อง", "ยาเม็ดแผนโบราณ ตราพระจันทร์");

        // 2. ยาชนิดใช้ภายนอก
        seededCount += seedIfNotExists("ยาเขียวถอนพิษ", "ยาชนิดใช้ภายนอก", 85.0, "ขวด", "ยาน้ำใช้ภายนอก สำหรับทาถอนพิษ ห้ามรับประทาน");
        seededCount += seedIfNotExists("กลีเซอรีน หญ้าดอกขาว", "ยาชนิดใช้ภายนอก", 25.0, "ขวด", "ยาหยอด/ป้าย ใช้ภายนอก");
        seededCount += seedIfNotExists("กลีเซอรีน เสลดพังพอน", "ยาชนิดใช้ภายนอก", 25.0, "ขวด", "ยาหยอด/ป้าย ใช้ภายนอก");
        seededCount += seedIfNotExists("ยาอบสมุนไพร", "ยาชนิดใช้ภายนอก", 35.0, "ห่อ", "สมุนไพรสำหรับต้มอบตัว");
        seededCount += seedIfNotExists("ยาหม่องไพล", "ยาชนิดใช้ภายนอก", 10.0, "ขวด", "ยาหม่องสมุนไพรสูตรไพล");
        seededCount += seedIfNotExists("ลูกประคบสมุนไพร", "ยาชนิดใช้ภายนอก", 50.0, "ลูก", "ลูกประคบสมุนไพรสด/แห้ง สำหรับประคบตัว");
        seededCount += seedIfNotExists("น้ำมันนวดเถาเอ็นอ่อน", "ยาชนิดใช้ภายนอก", 80.0, "ขวด", "น้ำมันนวดคลายเส้น เถาเอ็นอ่อน");
        seededCount += seedIfNotExists("สมุนไพรอบตัว บ้านสิริภัสสร", "ยาชนิดใช้ภายนอก", 35.0, "ห่อ", "สมุนไพรอบตัว สูตรบ้านสิริภัสสร");
        seededCount += seedIfNotExists("ลูกประคบสมุนไพร (ประคบหน้า)", "ยาชนิดใช้ภายนอก", 40.0, "ลูก", "ลูกประคบสมุนไพร สำหรับประคบใบหน้า");

        // 3. ยาดมสมุนไพร
        seededCount += seedIfNotExists("ยาดมน้ำมะกรูด", "ยาดมสมุนไพร", 25.0, "ขวด", "ยาดมสมุนไพรน้ำกลิ่นผิวมะกรูด");
        seededCount += seedIfNotExists("ยาดมสมุนไพรชิ้นไม้", "ยาดมสมุนไพร", 25.0, "ขวด", "ยาดมสมุนไพรหมักชิ้นไม้หอม");
        seededCount += seedIfNotExists("ยาดมพิมเสนน้ำยูคาลิปตัส", "ยาดมสมุนไพร", 40.0, "ขวด", "พิมเสนน้ำสูตรยูคาลิปตัส");
        seededCount += seedIfNotExists("เม็ดอมสมุนไพร (หญ้าดอกขาว)", "ยาดมสมุนไพร", 10.0, "ขวด", "เม็ดอมสมุนไพรลดความอยากบุหรี่/ชุ่มคอ");
        seededCount += seedIfNotExists("เม็ดอมสมุนไพร (บ๊วย)", "ยาดมสมุนไพร", 10.0, "ขวด", "เม็ดอมสมุนไพร รสบ๊วย");
        seededCount += seedIfNotExists("เม็ดอมสมุนไพร (มะนาว)", "ยาดมสมุนไพร", 10.0, "ขวด", "เม็ดอมสมุนไพร รสมะนาว");

        // 4. ยาลูกกลอน
        seededCount += seedIfNotExists("ยาลูกกลอนขมิ้นชัน", "ยาลูกกลอน", 50.0, "กระปุก", "ยาลูกกลอนสมุนไพรขมิ้นชัน");
        seededCount += seedIfNotExists("ยาลูกกลอนบำรุงธาตุ", "ยาลูกกลอน", 60.0, "กระปุก", "ยาลูกกลอนปรับสมดุลธาตุ");

        // 5. ชาชง
        seededCount += seedIfNotExists("ยาชง (หญ้าดอกขาว)", "ชาชง", 30.0, "ซอง", "ชาชงสมุนไพรหญ้าดอกขาว");
        seededCount += seedIfNotExists("ยาชง (รางจืด)", "ชาชง", 30.0, "ซอง", "ชาชงสมุนไพรรางจืด ล้างพิษ");
        seededCount += seedIfNotExists("ยาชง (ดอกคำฝอย)", "ชาชง", 40.0, "ซอง", "ชาชงสมุนไพรดอกคำฝอย บำรุงโลหิต");

        // 6. ยาผงใช้ภายนอก
        seededCount += seedIfNotExists("สมุนไพรพอกตา", "ยาผงใช้ภายนอก", 40.0, "ห่อ", "ผงสมุนไพรสำหรับพอกรอบดวงตา บรรเทาอาการเมื่อยล้า");
        seededCount += seedIfNotExists("ผงพอกหน้ารางจืด", "ยาผงใช้ภายนอก", 40.0, "ห่อ", "ผงสมุนไพรพอกหน้ารางจืด ดูดซับสารพิษ");

        // 7. สินค้าเพื่อสุขภาพ
        seededCount += seedIfNotExists("ดอกเกลือ", "สินค้าเพื่อสุขภาพ", 80.0, "ห่อ", "ดอกเกลือบริสุทธิ์เพื่อสุขภาพ");
        seededCount += seedIfNotExists("แยมผลไม้", "สินค้าเพื่อสุขภาพ", 45.0, "กระปุก", "แยมผลไม้ธรรมชาติเพื่อสุขภาพ");

        // 8. ยาผงรับประทาน
        seededCount += seedIfNotExists("ยาหอมทิพโอสถ", "ยาผงรับประทาน", 28.0, "ห่อ", "ยาหอมทิพโอสถ แก้ลมวิงเวียน");
        seededCount += seedIfNotExists("ยาหอมเทพจิตร", "ยาผงรับประทาน", 20.0, "ห่อ", "ยาหอมเทพจิตร บำรุงดวงจิต");
        seededCount += seedIfNotExists("ยาหอมอินทจักร์", "ยาผงรับประทาน", 40.0, "ห่อ", "ยาหอมอินทจักร์ แก้คลื่นเหียนอาเจียน");
        seededCount += seedIfNotExists("ยาหอมนวโกฐ (ชนิดห่อ)", "ยาผงรับประทาน", 25.0, "ห่อ", "ยาหอมนวโกฐชนิดซองห่อ");
        seededCount += seedIfNotExists("ยาหอมนวโกฐ (ชนิดขวด)", "ยาผงรับประทาน", 20.0, "ขวด", "ยาหอมนวโกฐชนิดขวด");
        seededCount += seedIfNotExists("ยาแก้ลมอัมพฤกษ์ชนิดผง", "ยาผงรับประทาน", 20.0, "ห่อ", "ยาผงแก้ลมอัมพฤกษ์ คลายเส้น");

        // 9. ยาแคปซูล (กระป๋อง)
        seededCount += seedIfNotExists("ยาฟ้าทะลายโจร (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 30.0, "กระป๋อง", "แคปซูลฟ้าทะลายโจร แก้ไข้ บรรเทาอาการเจ็บคอ");
        seededCount += seedIfNotExists("ยาตรีผลา (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 35.0, "กระป๋อง", "แคปซูลตรีผลา ล้างพิษ ปรับสมดุลลำไส้");
        seededCount += seedIfNotExists("ยาสหัสธารา (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 35.0, "กระป๋อง", "แคปซูลสหัสธารา ขับลมในเส้น แก้ปวดเมื่อย");
        seededCount += seedIfNotExists("บอระเพ็ด (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 25.0, "กระป๋อง", "แคปซูลบอระเพ็ด แก้ไข้ เจริญอาหาร");
        seededCount += seedIfNotExists("มะขามแขก (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 25.0, "กระป๋อง", "แคปซูลมะขามแขก ยาระบาย บรรเทาท้องผูก");
        seededCount += seedIfNotExists("มะระขี้นก (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 30.0, "กระป๋อง", "แคปซูลมะระขี้นก ช่วยเจริญอาหาร ลดน้ำตาล");
        seededCount += seedIfNotExists("ยาริดสีดวงตำรับเพชรสังฆาต (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 25.0, "กระป๋อง", "แคปซูลเพชรสังฆาต บรรเทาริดสีดวงทวาร");
        seededCount += seedIfNotExists("จันทลีลา (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 30.0, "กระป๋อง", "แคปซูลจันทลีลา แก้ไข้ตัวร้อน");
        seededCount += seedIfNotExists("ยาเขียวหอม (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 25.0, "กระป๋อง", "แคปซูลยาเขียวหอม ดับพิษไข้ ถอนพิษตานซาง");
        seededCount += seedIfNotExists("ยาแก้ไข้ 5 ราก (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 30.0, "กระป๋อง", "แคปซูลยา 5 ราก เบญจโลกวิเชียร แก้ไข้พิษ");
        seededCount += seedIfNotExists("ยาประสะจันทน์แดง (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 35.0, "กระป๋อง", "แคปซูลประสะจันทน์แดง แก้ไข้ตัวร้อน กระหายน้ำ");
        seededCount += seedIfNotExists("ยาธาตุบรรจบ (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 35.0, "กระป๋อง", "แคปซูลธาตุบรรจบ บรรเทาอาการท้องเสีย ท้องอืด");
        seededCount += seedIfNotExists("ยาเบญจกูล (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 65.0, "กระป๋อง", "แคปซูลเบญจกูล ปรับสมดุลธาตุทั้งสี่");
        seededCount += seedIfNotExists("ยาประสะกานพลู (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 65.0, "กระป๋อง", "แคปซูลประสะกานพลู บรรเทาปวดท้อง จุกเสียด");
        seededCount += seedIfNotExists("ยาประสะเจตพังคี (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 65.0, "กระป๋อง", "แคปซูลประสะเจตพังคี ขับลม แก้จุกแน่น");
        seededCount += seedIfNotExists("ยามันทธาตุ (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 30.0, "กระป๋อง", "แคปซูลมันทธาตุ แก้ท้องอืด ท้องเฟ้อ");
        seededCount += seedIfNotExists("ยาคลายเส้น (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 50.0, "กระป๋อง", "แคปซูลคลายเส้น บรรเทาปวดเมื่อยกล้ามเนื้อ");
        seededCount += seedIfNotExists("ยาประสะไพล (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 48.0, "กระป๋อง", "แคปซูลประสะไพล บรรเทาอาการปวดประจำเดือน");
        seededCount += seedIfNotExists("ยาริดสีดวง (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 50.0, "กระป๋อง", "แคปซูลตำรับริดสีดวง");
        seededCount += seedIfNotExists("ยาขมิ้นชัน (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 48.0, "กระป๋อง", "แคปซูลขมิ้นชัน บรรเทาอาการแน่นจุกเสียด ท้องอืด");
        seededCount += seedIfNotExists("ว่านชักมดลูก (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 50.0, "กระป๋อง", "แคปซูลว่านชักมดลูก ดูแลสุขภาพสตรี ประจำเดือนไม่ปกติ");
        seededCount += seedIfNotExists("ยาปราบชมพูทวีป (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 50.0, "กระป๋อง", "แคปซูลปราบชมพูทวีป บรรเทาหวัด ภูมิแพ้ คัดจมูก");
        seededCount += seedIfNotExists("ดีบัว (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 60.0, "กระป๋อง", "แคปซูลดีบัว ขยายหลอดเลือด บำรุงหัวใจ");
        seededCount += seedIfNotExists("ยาจตุผลาธิกะ (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 50.0, "กระป๋อง", "แคปซูลจตุผลาธิกะ ต้านอนุมูลอิสระ ปรับสมดุลตรีธาตุ");
        seededCount += seedIfNotExists("ยาจิตรารมณ์ (กระป๋อง)", "ยาแคปซูล (กระป๋อง)", 50.0, "กระป๋อง", "แคปซูลจิตรารมณ์ ช่วยผ่อนคลาย หลับสบาย");

        // 10. ยาแคปซูล (เม็ด)
        seededCount += seedIfNotExists("ยายกนัง", "ยาแคปซูล (เม็ด)", 0.70, "เม็ด", "แคปซูลยกนัง");
        seededCount += seedIfNotExists("ยามหาเบญจกูล", "ยาแคปซูล (เม็ด)", 0.70, "เม็ด", "แคปซูลมหาเบญจกูล");
        seededCount += seedIfNotExists("ยาพรหมพักตร์", "ยาแคปซูล (เม็ด)", 0.75, "เม็ด", "แคปซูลพรหมพักตร์");
        seededCount += seedIfNotExists("ยาฟ้าทะลายโจร (เม็ด)", "ยาแคปซูล (เม็ด)", 1.00, "เม็ด", "แคปซูลฟ้าทะลายโจรชนิดแบ่งเม็ด");
        seededCount += seedIfNotExists("ยาขมิ้นชัน (เม็ด)", "ยาแคปซูล (เม็ด)", 1.00, "เม็ด", "แคปซูลขมิ้นชันชนิดแบ่งเม็ด");
        seededCount += seedIfNotExists("ยาตรีผลา (เม็ด)", "ยาแคปซูล (เม็ด)", 1.00, "เม็ด", "แคปซูลตรีผลาชนิดแบ่งเม็ด");
        seededCount += seedIfNotExists("ยาสหัสธารา (เม็ด)", "ยาแคปซูล (เม็ด)", 1.00, "เม็ด", "แคปซูลสหัสธาราชนิดแบ่งเม็ด");
        seededCount += seedIfNotExists("ยาแก้ไข้ 5 ราก (เม็ด)", "ยาแคปซูล (เม็ด)", 1.00, "เม็ด", "แคปซูลยา 5 รากชนิดแบ่งเม็ด");

        // 11. สมุนไพรแห้ง (kg)
        seededCount += seedIfNotExists("สมอไทย", "สมุนไพรแห้ง", 200.0, "kg", "สมุนไพรแห้ง สมอไทย");
        seededCount += seedIfNotExists("เถาวัลย์เปรียง", "สมุนไพรแห้ง", 240.0, "kg", "สมุนไพรแห้ง เถาวัลย์เปรียง");
        seededCount += seedIfNotExists("Lemongrass dried", "สมุนไพรแห้ง", 150.0, "kg", "ตะไคร้แห้ง สมุนไพรแห้ง");
        seededCount += seedIfNotExists("ใบหนาด", "สมุนไพรแห้ง", 120.0, "kg", "สมุนไพรแห้ง ใบหนาด");
        seededCount += seedIfNotExists("เปล้าใหญ่", "สมุนไพรแห้ง", 180.0, "kg", "สมุนไพรแห้ง เปล้าใหญ่");
        seededCount += seedIfNotExists("ใบย่านาง (ผง)", "สมุนไพรแห้ง", 300.0, "kg", "ใบย่านางบดผง สมุนไพรแห้ง");
        seededCount += seedIfNotExists("ใบมะกรูด", "สมุนไพรแห้ง", 120.0, "kg", "สมุนไพรแห้ง ใบมะกรูด");
        seededCount += seedIfNotExists("กำแพงเจ็ดชั้น ( มะต่อมไก่ )", "สมุนไพรแห้ง", 180.0, "kg", "สมุนไพรแห้ง กำแพงเจ็ดชั้น (มะต่อมไก่)");
        seededCount += seedIfNotExists("หงอนไก่", "สมุนไพรแห้ง", 150.0, "kg", "สมุนไพรแห้ง หงอนไก่");
        seededCount += seedIfNotExists("หญ้าขัดใบมน", "สมุนไพรแห้ง", 140.0, "kg", "สมุนไพรแห้ง หญ้าขัดใบมน");
        seededCount += seedIfNotExists("ใบช้าพลู", "สมุนไพรแห้ง", 120.0, "kg", "สมุนไพรแห้ง ใบช้าพลู");
        seededCount += seedIfNotExists("ต้นช้าพลู", "สมุนไพรแห้ง", 100.0, "kg", "สมุนไพรแห้ง ต้นช้าพลู");
        seededCount += seedIfNotExists("บานไม่รู้โรยป่า", "สมุนไพรแห้ง", 160.0, "kg", "สมุนไพรแห้ง บานไม่รู้โรยป่า");
        seededCount += seedIfNotExists("ไมยราบเล็ก", "สมุนไพรแห้ง", 130.0, "kg", "สมุนไพรแห้ง ไมยราบเล็ก");
        seededCount += seedIfNotExists("หญ้าพันธุ์งูขาว", "สมุนไพรแห้ง", 150.0, "kg", "สมุนไพรแห้ง หญ้าพันธุ์งูขาว");
        seededCount += seedIfNotExists("หญ้าขัดมอนใบยาว", "สมุนไพรแห้ง", 140.0, "kg", "สมุนไพรแห้ง หญ้าขัดมอนใบยาว");
        seededCount += seedIfNotExists("สังกรณี กวางตูดแฉะ", "สมุนไพรแห้ง", 170.0, "kg", "สมุนไพรแห้ง สังกรณี กวางตูดแฉะ");
        seededCount += seedIfNotExists("ปืนนกไส้", "สมุนไพรแห้ง", 150.0, "kg", "สมุนไพรแห้ง ปืนนกไส้");
        seededCount += seedIfNotExists("ใบมะรุม", "สมุนไพรแห้ง", 120.0, "kg", "สมุนไพรแห้ง ใบมะรุม");
        seededCount += seedIfNotExists("ขันทองพยาบาท ป่าช้าหมอง", "สมุนไพรแห้ง", 220.0, "kg", "สมุนไพรแห้ง ขันทองพยาบาท ป่าช้าหมอง");
        seededCount += seedIfNotExists("หญ้าหนวดแมว", "สมุนไพรแห้ง", 180.0, "kg", "สมุนไพรแห้ง หญ้าหนวดแมว");
        seededCount += seedIfNotExists("น้ำใจใคร่", "สมุนไพรแห้ง", 160.0, "kg", "สมุนไพรแห้ง น้ำใจใคร่");
        seededCount += seedIfNotExists("ส้มป่อย", "สมุนไพรแห้ง", 150.0, "kg", "สมุนไพรแห้ง ส้มป่อย");
        seededCount += seedIfNotExists("รางจืด", "สมุนไพรแห้ง", 160.0, "kg", "สมุนไพรแห้ง รางจืด");
        seededCount += seedIfNotExists("ใบข่อย", "สมุนไพรแห้ง", 120.0, "kg", "สมุนไพรแห้ง ใบข่อย");
        seededCount += seedIfNotExists("ผิวมะกรูด", "สมุนไพรแห้ง", 150.0, "kg", "สมุนไพรแห้ง ผิวมะกรูด");
        seededCount += seedIfNotExists("โด่ไม่รู้ล้ม", "สมุนไพรแห้ง", 200.0, "kg", "สมุนไพรแห้ง โด่ไม่รู้ล้ม");
        seededCount += seedIfNotExists("หญ้าพันธุ์งูแดง", "สมุนไพรแห้ง", 150.0, "kg", "สมุนไพรแห้ง หญ้าพันธุ์งูแดง");
        seededCount += seedIfNotExists("โรกขาว", "สมุนไพรแห้ง", 180.0, "kg", "สมุนไพรแห้ง โรกขาว");

        if (seededCount > 0) {
            log.info("Successfully seeded {} medicines into catalog.", seededCount);
        } else {
            log.info("Medicines are already seeded. Skipped.");
        }
    }

    private int seedIfNotExists(String name, String category, Double unitPrice, String unitType, String note) {
        if (medicineRepository.existsByMedicineNameIgnoreCase(name.trim())) {
            return 0;
        }

        Medicine medicine = new Medicine();
        medicine.setMedicineName(name.trim());
        medicine.setMedicineCategory(category);
        medicine.setUnitPrice(unitPrice);
        medicine.setUnitType(unitType);
        medicine.setStockRemaining(0);
        medicine.setStockReceived(0);
        medicine.setStockIssued(0);
        medicine.setStockBroughtForward(0);
        medicine.setNote(note);

        medicineRepository.save(medicine);
        return 1;
    }
}
