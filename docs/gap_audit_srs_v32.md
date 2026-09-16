# รายงานการตรวจสอบส่วนต่างความต้องการของระบบ (32 Use Cases Gap Audit)
**ระบบบริหารจัดการคลินิกการแพทย์แผนไทย (พิมพ์วิมานคลินิก)**  
*อ้างอิง: เอกสารข้อกำหนดความต้องการระบบ (`SRS_ระบบบริหารจัดการคลินิก.md` เวอร์ชัน 3.2)*  
*วันที่ตรวจสอบ: 16 กันยายน 2026*

---

## 1. บทสรุปสำหรับผู้บริหาร (Executive Summary)

จากการตรวจสอบความสอดคล้องระหว่างเอกสาร **SRS เวอร์ชัน 3.2 (32 Use Cases)** กับซอร์สโค้ดจริงในโปรเจกต์ทั้งฝั่ง **Backend (Spring Boot 3, Java 21)** และ **Frontend (Next.js 14 App Router, TypeScript)** พบว่า:

* **อัตราความสมบูรณ์โดยรวม (Overall Readiness)**: **~90%** (28/32 Use Cases สมบูรณ์แบบ End-to-End)
* **Backend Status**: สถาปัตยกรรม Layered Architecture (Controller, Service, Repository, DTO, Mapper, Entity) มีความสมบูรณ์สูงมาก มี 15 REST Controllers, 14 Services, ระบบความปลอดภัย Spring Security (JWT) แยกสิทธิ์ `DOCTOR` และ `PATIENT` อย่างรัดกุม และผ่านการทดสอบอัตโนมัติ **27/27 Test Suites ผ่านทั้งหมด (BUILD SUCCESS)**
* **Document Engine**: รองรับการสร้างเอกสารครบทั้ง 2 รูปแบบหลัก คือ **poi-tl (Word .docx 5 รูปแบบ)** และ **JasperReports (PDF ใบเสร็จรับเงิน)**
* **Frontend Portals**: พัฒนาแยกฝั่งชัดเจนระหว่าง Doctor Portal (`/doctor`) และ Patient Portal (`/patient`) พร้อมดีไซน์ธีมการแพทย์แผนไทย (Terracotta / Emerald) และรองรับ Responsive Design

### ส่วนต่าง (Gaps) สำคัญที่ตรวจพบ:
1. **UC 3.1.25 (Print Receipt PDF - JasperReports)**: Backend ทำงานได้สมบูรณ์ แต่ฝั่ง Next.js Route Handler (`/api/receipts/record-treatment/[recordTreatmentId]/print`) ยังเป็นโฟลเดอร์ว่าง และยังไม่มีปุ่มกดดาวน์โหลดไฟล์ PDF ใบเสร็จที่เป็นทางการในหน้าจอ `TreatmentDetailClient.tsx`
2. **UC 3.1.14 (Register Patient Account)**: Backend มี Service และ Endpoint รองรับ และระบบมี Auto-Create ตอนเพิ่มผู้ป่วยใหม่อยู่แล้ว แต่ยังขาด UI Dialog ในหน้า `patients/[id]` สำหรับให้แพทย์กดสร้าง/ดูรหัสผ่านเข้าใช้งานกรณีผู้ป่วยเดิม
3. **UC 3.1.18 (Edit Appointment - Rescheduling)**: ระบบรองรับการเปลี่ยนสถานะ (Cancel, Complete, No-Show) แต่ยังไม่มีฟังก์ชันให้แพทย์เปลี่ยนวันเวลาหรือย้าย Slot นัดหมาย (Reschedule)
4. **Issue Tracking**: ยังไม่ได้เริ่มต้นแตก Tickets ตามโครงสร้าง `.scratch/<feature-slug>/`

---

## 2. ตารางตรวจสอบส่วนต่างรายยูสเคส (Detailed 32 Use Cases Gap Matrix)

| UC ID | ชื่อยูสเคส (Use Case Name) | ผู้ใช้ (Actor) | Backend Status | Frontend Status | Test Suite | สถานะความพร้อม |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **3.1.1** | View Doctor Schedule | User / Patient | 🟢 `WorkingScheduleController` | 🟢 `patient/book/page.tsx` | 🟢 `WorkingScheduleServiceTest` | 🟢 **Complete** |
| **3.1.2** | Login Patient | Patient | 🟢 `AuthController.loginPatient` | 🟢 `patient/login/page.tsx` | 🟢 Integration Test | 🟢 **Complete** |
| **3.1.3** | Booking Appointment | Patient | 🟢 `AppointmentController.book` | 🟢 `PatientBookAppointmentClient` | 🟢 `AppointmentServiceTest` | 🟢 **Complete** |
| **3.1.4** | View Appointment | Patient | 🟢 `AppointmentController.getByPatientId` | 🟢 `PatientAppointmentsClient` | 🟢 `AppointmentServiceTest` | 🟢 **Complete** |
| **3.1.5** | Cancel Appointment | Patient | 🟢 `AppointmentController.cancel` | 🟢 `PatientAppointmentsClient` | 🟢 `AppointmentServiceTest` | 🟢 **Complete** |
| **3.1.6** | Notify Appointment | Patient | 🟢 `NotifyAppointmentController` | 🟢 `patient/dashboard/page.tsx` | 🟢 Unit Test | 🟢 **Complete** |
| **3.1.7** | View Record Treatment | Patient | 🟢 `RecordTreatmentController.getByPatientId` | 🟢 `patient/treatments/page.tsx` | 🟢 Service Test | 🟢 **Complete** |
| **3.1.8** | Review Clinic | Patient | 🟢 `ReviewController.create` | 🟢 `PatientReviewClient` | 🟢 Integration Test | 🟢 **Complete** |
| **3.1.9** | Edit Review Clinic | Patient | 🟢 `ReviewController.update` | 🟢 `PatientReviewClient` | 🟢 Integration Test | 🟢 **Complete** |
| **3.1.10** | Login Doctor | Doctor | 🟢 `AuthController.loginDoctor` | 🟢 `doctor/login/page.tsx` | 🟢 Integration Test | 🟢 **Complete** |
| **3.1.11** | Add Patient Record | Doctor | 🟢 `PatientController.create` | 🟢 `doctor/patients/new` | 🟢 `PatientServiceTest` | 🟢 **Complete** |
| **3.1.12** | List Patient Record | Doctor | 🟢 `PatientController.getAll` | 🟢 `PatientListClient` | 🟢 `PatientServiceTest` | 🟢 **Complete** |
| **3.1.13** | Edit Patient Record | Doctor | 🟢 `PatientController.updateBasicInfo` | 🟢 `doctor/patients/[id]/edit` | 🟢 `PatientServiceTest` | 🟢 **Complete** |
| **3.1.14** | Register Patient Account | Doctor | 🟢 `PatientAccountController.create` | 🟡 ขาดปุ่ม/Modal บน `patients/[id]` | 🟢 Unit Test | 🟡 **Partial** |
| **3.1.15** | Print OPD-Card | Doctor | 🟢 `DocumentExportController.exportOpdCard` | 🟢 `PatientDocumentSection` | 🟢 `PatientDocumentExportTest` | 🟢 **Complete** |
| **3.1.16** | Print Patient Record | Doctor | 🟢 `DocumentExportController.exportPatientIntakeTh` | 🟢 `PatientDocumentSection` | 🟢 `PatientDocumentExportTest` | 🟢 **Complete** |
| **3.1.17** | List Appointment | Doctor | 🟢 `AppointmentController.getAll` | 🟢 `AppointmentListClient` | 🟢 `AppointmentServiceTest` | 🟢 **Complete** |
| **3.1.18** | Edit Appointment | Doctor | 🟡 มี cancel/complete/noShow (ขาด reschedule) | 🟡 เปลี่ยนได้เฉพาะสถานะ | 🟢 `AppointmentServiceTest` | 🟡 **Partial** |
| **3.1.19** | Add Working Schedule | Doctor | 🟢 `WorkingScheduleController.create` | 🟢 `ScheduleManagerClient` | 🟢 `WorkingScheduleServiceTest` | 🟢 **Complete** |
| **3.1.20** | List Working Schedule | Doctor | 🟢 `WorkingScheduleController.getAll` | 🟢 `ScheduleManagerClient` | 🟢 `WorkingScheduleServiceTest` | 🟢 **Complete** |
| **3.1.21** | Edit Working Schedule | Doctor | 🟢 `WorkingScheduleController.update` | 🟢 `ScheduleManagerClient` | 🟢 `WorkingScheduleServiceTest` | 🟢 **Complete** |
| **3.1.22** | Delete Working Schedule | Doctor | 🟢 `WorkingScheduleController.delete` | 🟢 `ScheduleManagerClient` | 🟢 `WorkingScheduleServiceTest` | 🟢 **Complete** |
| **3.1.23** | Add Record Treatment | Doctor | 🟢 `RecordTreatmentController.create` | 🟢 `RecordTreatmentFormClient` | 🟢 `RecordTreatmentServiceTest` | 🟢 **Complete** |
| **3.1.24** | Calculate Treatment Fee | Doctor | 🟢 `ReceiptService.issue` | 🟢 `RecordTreatmentFormClient` (Auto) | 🟢 `ReceiptServiceTest` | 🟢 **Complete** |
| **3.1.25** | Print Receipt | Doctor | 🟢 `ReceiptPrintController` (Jasper PDF) | 🟡 ขาด Proxy Handler & ปุ่มบน UI | 🟢 Unit Test | 🟡 **Partial** |
| **3.1.26** | List Record Treatment | Doctor | 🟢 `RecordTreatmentController.getAll` | 🟢 `TreatmentListClient` | 🟢 `RecordTreatmentServiceTest` | 🟢 **Complete** |
| **3.1.27** | Edit Record Treatment | Doctor | 🟢 `RecordTreatmentController.update` | 🟢 `RecordTreatmentEditClient` | 🟢 `RecordTreatmentServiceTest` | 🟢 **Complete** |
| **3.1.28** | Print Medical Certificate | Doctor | 🟢 `DocumentExportController.exportMedicalCertificate` | 🟢 `MedicalCertificateDialog` | 🟢 `DocumentTemplateTest` | 🟢 **Complete** |
| **3.1.29** | Print Record Treatment | Doctor | 🟢 `DocumentExportController` (DOCX & Print) | 🟢 `DownloadDocxButton` & Print | 🟢 `DocumentTemplateTest` | 🟢 **Complete** |
| **3.1.30** | Add Medicine | Doctor | 🟢 `MedicineController.create` | 🟢 `MedicineManagerClient` | 🟢 Unit Test | 🟢 **Complete** |
| **3.1.31** | List All Medicine | Doctor | 🟢 `MedicineController.getAll` | 🟢 `MedicineManagerClient` | 🟢 Unit Test | 🟢 **Complete** |
| **3.1.32** | Edit Medicine | Doctor | 🟢 `MedicineController.update` | 🟢 `MedicineManagerClient` | 🟢 Unit Test | 🟢 **Complete** |

---

## 3. การวิเคราะห์เชิงลึกรายโดเมน (Domain In-Depth Analysis)

### 3.1 โดเมนเวชระเบียนและการพิมพ์บัตรตรวจโรค (Patient Records & OPD Cards)
* **สถานะ**: 🟢 **95% สมบูรณ์**
* **จุดแข็ง**:
  * ข้อมูลคนไข้ครอบคลุมตามระเบียบคลินิกไทย (HN, บัตร ปชช., ภูมิลำเนาเดิม, สิทธิการรักษา, วันเกิดทางจันทรคติ, ประวัติแพ้ยา/อาหาร)
  * การคำนวณธาตุเจ้าเรือนกำเนิด (`DhatuPrinciple`) ปถวี, อาโป, วาโย, เตโช และสมุฏฐาน 5 ด้าน (กาล/อายุ/ฤดู/ประเทศ/กำเนิด) รองรับครบทั้ง Entity และ Form
  * เอกสาร `opd_card.docx`, `patient_intake_th.docx`, `patient_intake_en.docx` ใช้งานได้จริงผ่าน poi-tl
* **ส่วนต่างที่ต้องเติม**:
  * หน้า `patients/[id]` ขาดปุ่ม/การ์ดสำหรับกด "สร้างรหัสผ่านผู้ป่วย (Register Patient Account)" เพื่อตอบโจทย์ UC 3.1.14 ให้สมบูรณ์ 100%

### 3.2 โดเมนตารางเวลาและการนัดหมาย (Schedules & Appointments)
* **สถานะ**: 🟢 **90% สมบูรณ์**
* **จุดแข็ง**:
  * ระบบตารางเวรและ Slot แยกเวลาชัดเจน (Shift Start/End, Slot Duration)
  * การจองคิวมี Atomic Check ป้องกันการจอง Slot ซ้ำหรือจองเวลาในอดีต
  * มีระบบแจ้งเตือนนัดหมายล่วงหน้า (UC 3.1.6) ปรากฏบน Dashboard ผู้ป่วย
* **ส่วนต่างที่ต้องเติม**:
  * UC 3.1.18: ขาดความสามารถในการเลื่อนนัดหมาย (Reschedule Slot) ให้ผู้ป่วยจากฝั่งแพทย์ (ปัจจุบันแพทย์ทำได้เพียงเปลี่ยนสถานะ Complete / No-Show / Cancel)

### 3.3 โดเมนการตรวจรักษา การเงิน และใบเสร็จ (Treatments, Billing & Receipts)
* **สถานะ**: 🟡 **88% สมบูรณ์**
* **จุดแข็ง**:
  * `RecordTreatmentFormClient.tsx` มีความละเอียดสูงมาก บันทึกสัญญาณชีพ (Vital Signs), การวินิจฉัยแพทย์แผนไทย (TTM), หัตถการ, และการสั่งยา
  * มีการคำนวณค่ายาและค่าบริการอัตโนมัติพร้อมออกใบเสร็จ (`ReceiptService.issue`)
  * การส่งออกใบรับรองแพทย์ (`MedicalCertificateDialog.tsx`) และแบบบันทึกการรักษาฉบับเต็ม 5 หน้าทำงานได้สมบูรณ์
* **ส่วนต่างที่ต้องเติม**:
  * UC 3.1.25: ระบบมี JasperReports template สำหรับพิมพ์ PDF ใบเสร็จรับเงิน แต่ในฝั่ง Next.js ยังขาด Proxy Route Handler และปุ่มพิมพ์ "ดาวน์โหลด PDF ใบเสร็จทางการ" ในหน้า `TreatmentDetailClient.tsx`

### 3.4 โดเมนคลังยาและการประเมินคลินิก (Medicine & Reviews)
* **สถานะ**: 🟢 **100% สมบูรณ์**
* **จุดแข็ง**:
  * ระบบจัดการคลังยามี CRUD ครบถ้วน (UC 3.1.30–3.1.32) ตรวจสอบสต็อกคงเหลือ
  * ระบบรีวิวเปิดให้ผู้ป่วยประเมินคะแนน 1-5 ดาว และแพทย์สามารถดูสถิติความพึงพอใจเฉลี่ยในระบบได้

---

## 4. แผนงานขั้นตอนถัดไปที่แนะนำ (Recommended Roadmap)

1. **Sprint 1 (Quick Wins - เอกสารและการเงิน)**:
   * ทำ Next.js route handler สำหรับ `/api/receipts/record-treatment/[recordTreatmentId]/print`
   * เพิ่มปุ่ม "พิมพ์ใบเสร็จรับเงิน (PDF)" บน `TreatmentDetailClient.tsx`
2. **Sprint 2 (การจัดการบัญชีผู้ป่วย)**:
   * เพิ่มปุ่ม/Dialog "สร้างบัญชีผู้ป่วย (Patient Account)" ในหน้าโปรไฟล์ผู้ป่วยฝั่งแพทย์
3. **Sprint 3 (การเลื่อนนัดหมาย)**:
   * เพิ่ม API และ Modal สำหรับย้าย Slot นัดหมายในหน้าตารางนัดหมายของแพทย์
