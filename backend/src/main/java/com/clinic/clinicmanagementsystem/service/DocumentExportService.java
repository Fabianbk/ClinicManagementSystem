package com.clinic.clinicmanagementsystem.service;

import com.clinic.clinicmanagementsystem.entity.*;
import com.clinic.clinicmanagementsystem.enums.*;
import com.clinic.clinicmanagementsystem.exception.ResourceNotFoundException;
import com.clinic.clinicmanagementsystem.repository.PatientRepository;
import com.clinic.clinicmanagementsystem.repository.RecordTreatmentRepository;
import com.deepoove.poi.XWPFTemplate;
import com.deepoove.poi.config.Configure;
import com.deepoove.poi.plugin.table.LoopRowTableRenderPolicy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentExportService {

    private final PatientRepository patientRepository;
    private final RecordTreatmentRepository recordTreatmentRepository;

    private static final String CHECKED = "☑";
    private static final String UNCHECKED = "☐";

    /**
     * Export complete Client Intake Form & Treatment Record (Pages 1-6 or Pages
     * 1-4)
     * as Word document (.docx).
     *
     * @param patientId         ID of the patient
     * @param recordTreatmentId optional ID of a specific treatment record visit
     */
    public byte[] exportClientIntakeForm(Integer patientId, Integer recordTreatmentId) {
        RecordTreatment treatment = null;
        Patient patient = null;

        if (recordTreatmentId != null && recordTreatmentId > 0) {
            treatment = recordTreatmentRepository.findById(recordTreatmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("RecordTreatment", recordTreatmentId));
            patient = treatment.getPatient();
        }

        if (patient == null && patientId != null && patientId > 0) {
            patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
        }

        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found for the requested document");
        }

        Map<String, Object> data = buildTemplateData(patient, treatment);
        return renderTemplate("templates/client_intake_form.docx", data);
    }

    /**
     * Export standalone Treatment Order / Prescription (Page 5) as Word (.docx).
     */
    public byte[] exportTreatmentOrder(int recordTreatmentId) {
        RecordTreatment treatment = recordTreatmentRepository.findById(recordTreatmentId)
                .orElseThrow(() -> new ResourceNotFoundException("RecordTreatment", recordTreatmentId));
        Patient patient = treatment.getPatient();
        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found for treatment ID: " + recordTreatmentId);
        }

        Map<String, Object> data = buildTemplateData(patient, treatment);
        return renderTemplate("templates/treatment_order.docx", data);
    }

    /**
     * Maps Patient, DhatuPrinciple, HealthProfile, and RecordTreatment into a
     * comprehensive data map
     * with tag names matching Word placeholders like {{patientName}}, {{cb_male}},
     * etc.
     */
    public Map<String, Object> buildTemplateData(Patient patient, RecordTreatment treatment) {
        Map<String, Object> data = new HashMap<>();

        // ==========================================
        // 1. ข้อมูลทั่วไป (Part 1: Personal Information)
        // ==========================================
        data.put("opdCardNo",
                defaultStr(patient.getPatientId() > 0 ? String.format("OPD-%05d", patient.getPatientId()) : ""));
        data.put("patientName", defaultStr(patient.getFullname()));
        data.put("idCard", defaultStr(patient.getIdNumber()));
        data.put("occupation", defaultStr(patient.getOccupation()));

        // เพศ
        Gender gender = patient.getGender();
        data.put("gender_male", check(gender == Gender.MALE));
        data.put("gender_female", check(gender == Gender.FEMALE));

        // วันเดือนปีเกิด
        if (patient.getDateOfBirth() != null) {
            SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy", Locale.of("th", "TH"));
            data.put("dobSolar", df.format(patient.getDateOfBirth()));

            LocalDate birth = patient.getDateOfBirth().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            LocalDate now = LocalDate.now();
            Period period = Period.between(birth, now);
            data.put("ageYears", String.valueOf(period.getYears()));
            data.put("ageMonths", String.valueOf(period.getMonths()));
            data.put("ageDays", String.valueOf(period.getDays()));
        } else {
            data.put("dobSolar", "");
            data.put("ageYears", "");
            data.put("ageMonths", "");
            data.put("ageDays", "");
        }
        data.put("dobThai", defaultStr(patient.getThaiCalendarBirthDate()));

        // สถานภาพ (Status)
        MaritalStatus ms = patient.getMaritalStatus();
        data.put("status_single", check(ms == MaritalStatus.SINGLE));
        data.put("status_relationship", check(ms == MaritalStatus.IN_RELATIONSHIP));
        data.put("status_married", check(ms == MaritalStatus.MARRIED));
        data.put("status_widowed", check(ms == MaritalStatus.WIDOWED));
        data.put("status_separated", check(ms == MaritalStatus.SEPARATED));
        data.put("status_divorced", check(ms == MaritalStatus.DIVORCED));
        data.put("status_monk", check(ms == MaritalStatus.MONK));

        // ที่อยู่ & ข้อมูลติดต่อ
        data.put("currentAddress", defaultStr(patient.getFullAddress()));
        data.put("birthPlace", defaultStr(patient.getBirthPlace()));
        data.put("province", defaultStr(patient.getProvince()));
        data.put("phone", defaultStr(patient.getMobileNumber()));
        data.put("ethnicity", defaultStr(patient.getEthnicity()));
        data.put("citizenship", defaultStr(patient.getCitizenship()));
        data.put("religion", defaultStr(patient.getReligion()));

        // ==========================================
        // 2. ธาตุสมุฏฐาน (Dhatu Principles)
        // ==========================================
        DhatuPrinciple principle = patient.getPrinciple();
        if (principle != null) {
            // ธาตุเจ้าเรือนหลัก
            Dhatu pDhatu = principle.getPrincipalDhatu();
            data.put("pd_earth", check(pDhatu == Dhatu.PATHAVI));
            data.put("pd_water", check(pDhatu == Dhatu.APO));
            data.put("pd_air", check(pDhatu == Dhatu.VAYO));
            data.put("pd_fire", check(pDhatu == Dhatu.TECHO));

            // ธาตุเจ้าเรือนรอง
            Dhatu sDhatu = principle.getSecondaryDhatu();
            data.put("sd_earth", check(sDhatu == Dhatu.PATHAVI));
            data.put("sd_water", check(sDhatu == Dhatu.APO));
            data.put("sd_air", check(sDhatu == Dhatu.VAYO));
            data.put("sd_fire", check(sDhatu == Dhatu.TECHO));

            // ปฏิสนธิ/ตอนเกิด
            Dhatu cDhatu = principle.getConceptionDhatu();
            data.put("cd_earth", check(cDhatu == Dhatu.PATHAVI));
            data.put("cd_water", check(cDhatu == Dhatu.APO));
            data.put("cd_air", check(cDhatu == Dhatu.VAYO));
            data.put("cd_fire", check(cDhatu == Dhatu.TECHO));

            // ปฏิสนธิลักษณะ
            TriDosha cChar = principle.getConceptionCharacteristic();
            data.put("cc_semha", check(cChar == TriDosha.SEMHA));
            data.put("cc_vata", check(cChar == TriDosha.VATA));
            data.put("cc_pitta", check(cChar == TriDosha.PITTA));

            // อุตุสมุฏฐาน เมื่อเริ่มเจ็บป่วย
            TriDosha sOnset = principle.getSeasonalOnset();
            data.put("so_semha", check(sOnset == TriDosha.SEMHA));
            data.put("so_vata", check(sOnset == TriDosha.VATA));
            data.put("so_pitta", check(sOnset == TriDosha.PITTA));

            // อุตุสมุฏฐาน เมื่อมาพบแพทย์
            TriDosha sCur = principle.getSeasonalCurrent();
            data.put("sc_semha", check(sCur == TriDosha.SEMHA));
            data.put("sc_vata", check(sCur == TriDosha.VATA));
            data.put("sc_pitta", check(sCur == TriDosha.PITTA));

            // อายุสมุฏฐาน
            AgePrinciple ap = principle.getAgePrinciple();
            data.put("age_child", check(ap == AgePrinciple.CHILD));
            data.put("age_adult", check(ap == AgePrinciple.ADULT));
            data.put("age_aging", check(ap == AgePrinciple.AGING));

            // กาลสมุฏฐาน เมื่ออาการกำเริบ
            TriDosha tOnset = principle.getTimeOnset();
            data.put("to_semha", check(tOnset == TriDosha.SEMHA));
            data.put("to_vata", check(tOnset == TriDosha.VATA));
            data.put("to_pitta", check(tOnset == TriDosha.PITTA));

            // กาลสมุฏฐาน เมื่อมาพบแพทย์
            TriDosha tCur = principle.getTimeCurrent();
            data.put("tc_semha", check(tCur == TriDosha.SEMHA));
            data.put("tc_vata", check(tCur == TriDosha.VATA));
            data.put("tc_pitta", check(tCur == TriDosha.PITTA));

            // ประเทศสมุฏฐาน ภูมิลำเนา
            Dhatu gb = principle.getGeoBirthplace();
            data.put("gb_earth", check(gb == Dhatu.PATHAVI));
            data.put("gb_water", check(gb == Dhatu.APO));
            data.put("gb_air", check(gb == Dhatu.VAYO));
            data.put("gb_fire", check(gb == Dhatu.TECHO));

            // ประเทศสมุฏฐาน ปัจจุบัน
            Dhatu gc = principle.getGeoCurrent();
            data.put("gc_earth", check(gc == Dhatu.PATHAVI));
            data.put("gc_water", check(gc == Dhatu.APO));
            data.put("gc_air", check(gc == Dhatu.VAYO));
            data.put("gc_fire", check(gc == Dhatu.TECHO));
        } else {
            fillPrincipleDefaults(data);
        }

        // ==========================================
        // 3. ประวัติสุขภาพ (HealthProfile) & ประวัติปัจจุบัน/ส่วนตัว
        // ==========================================
        HealthProfile hp = treatment != null ? treatment.getHealthProfile() : null;

        // ประวัติการเจ็บป่วยปัจจุบัน (Present History) - ดึงจาก treatment ก่อน ถ้าไม่มีจึงดึงจาก healthProfile
        String presentHistoryStr = "";
        if (treatment != null && treatment.getPresentHistory() != null && !treatment.getPresentHistory().isBlank()) {
            presentHistoryStr = treatment.getPresentHistory();
        } else if (hp != null && hp.getPresentHistory() != null) {
            presentHistoryStr = hp.getPresentHistory();
        }
        data.put("presentHistory", defaultStr(presentHistoryStr));

        // ประวัติส่วนตัวและวิถีชีวิต (Personal History) - ดึงจาก treatment ก่อน ถ้าไม่มีจึงดึงจาก healthProfile
        String personalHistoryStr = "";
        if (treatment != null && treatment.getPersonalHistory() != null && !treatment.getPersonalHistory().isBlank()) {
            personalHistoryStr = treatment.getPersonalHistory();
        } else if (hp != null && hp.getPersonalHistory() != null) {
            personalHistoryStr = hp.getPersonalHistory();
        }
        data.put("personalHistory", defaultStr(personalHistoryStr));

        if (hp != null) {
            // โรคประจำตัว
            String dis = hp.getUnderlyingDisease();
            boolean hasDisease = dis != null && !dis.isBlank() && !dis.contains("ปฏิเสธ") && !dis.equalsIgnoreCase("ไม่มี");
            data.put("dis_deny", check(!hasDisease));
            data.put("dis_have", check(hasDisease));
            data.put("diseaseDetail", hasDisease ? dis : "");

            // แพ้ยา
            String drug = hp.getDrugAllergy();
            boolean hasDrugAllergy = drug != null && !drug.isBlank() && !drug.contains("ปฏิเสธ") && !drug.equalsIgnoreCase("ไม่มี");
            data.put("drug_deny", check(!hasDrugAllergy));
            data.put("drug_have", check(hasDrugAllergy));
            data.put("drugAllergyDetail", hasDrugAllergy ? drug : "");

            // แพ้อาหาร
            String food = hp.getFoodAllergy();
            boolean hasFoodAllergy = food != null && !food.isBlank() && !food.contains("ปฏิเสธ") && !food.equalsIgnoreCase("ไม่มี");
            data.put("food_deny", check(!hasFoodAllergy));
            data.put("food_have", check(hasFoodAllergy));
            data.put("foodAllergyDetail", hasFoodAllergy ? food : "");

            // ประวัติครอบครัว (โรคทางพันธุกรรม)
            String fam = hp.getHereditaryDisease();
            boolean hasHereditary = fam != null && !fam.isBlank() && !fam.contains("ปฏิเสธ") && !fam.equalsIgnoreCase("ไม่มี");
            data.put("fam_deny", check(!hasHereditary));
            data.put("fam_have", check(hasHereditary));

            // พฤติกรรม (แอลกอฮอล์ / บุหรี่)
            String alc = hp.getAlcoholConsumption();
            boolean drinks = alc != null && alc.contains("ดื่ม") && !alc.contains("ปฏิเสธ");
            data.put("alcohol_deny", check(!drinks));
            data.put("alcohol_have", check(drinks));

            String smk = hp.getSmokingHistory();
            boolean smokes = smk != null && smk.contains("สูบ") && !smk.contains("ปฏิเสธ");
            data.put("smoke_deny", check(!smokes));
            data.put("smoke_have", check(smokes));

            // ประจำเดือน
            data.put("menstruationHistory", defaultStr(hp.getMenstruation()));
        } else {
            fillHealthDefaults(data);
        }

        // ==========================================
        // 4. บันทึกการตรวจรักษา (RecordTreatment)
        // ==========================================
        if (treatment != null) {
            SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy", Locale.of("th", "TH"));
            SimpleDateFormat tf = new SimpleDateFormat("HH:mm", Locale.of("th", "TH"));
            data.put("visitDate", treatment.getRecordDate() != null ? df.format(treatment.getRecordDate()) : "");
            data.put("visitTime", treatment.getRecordDate() != null ? tf.format(treatment.getRecordDate()) : "");

            data.put("symptoms", defaultStr(treatment.getSymptoms()));

            // สัญญาณชีพ & ร่างกาย
            data.put("temp", treatment.getTemp() != null ? String.valueOf(treatment.getTemp()) : "");
            data.put("pulse", treatment.getPulse() != null ? String.valueOf(treatment.getPulse()) : "");
            data.put("respirationRate",
                    treatment.getRespirationRate() != null ? String.valueOf(treatment.getRespirationRate()) : "");
            data.put("bp", defaultStr(treatment.getBp()));
            data.put("height", treatment.getHeight() != null ? String.valueOf(treatment.getHeight()) : "");
            data.put("weight", treatment.getWeight() != null ? String.valueOf(treatment.getWeight()) : "");
            data.put("bmi", treatment.getBmi() != null ? String.format(Locale.US, "%.2f", treatment.getBmi()) : "");

            // Reflex
            data.put("bicepRt", defaultStr(treatment.getBicepRt()));
            data.put("bicepLt", defaultStr(treatment.getBicepLt()));
            data.put("tricepsRt", defaultStr(treatment.getTricepsRt()));
            data.put("tricepsLt", defaultStr(treatment.getTricepsLt()));
            data.put("kneeRt", defaultStr(treatment.getKneeRt()));
            data.put("kneeLt", defaultStr(treatment.getKneeLt()));
            data.put("ankleRt", defaultStr(treatment.getAnkleRt()));
            data.put("ankleLt", defaultStr(treatment.getAnkleLt()));

            // มูลเหตุการเกิดโรค (Symptom Causes)
            Set<SymptomCause> causes = treatment.getCausesOfSymptoms();
            data.put("cause_food", check(causes != null && causes.contains(SymptomCause.FOOD)));
            data.put("cause_posture", check(causes != null && causes.contains(SymptomCause.POSTURE)));
            data.put("cause_weather", check(causes != null && causes.contains(SymptomCause.WEATHER)));
            data.put("cause_fasting", check(causes != null && causes.contains(SymptomCause.FASTING_LACK_SLEEP)));
            data.put("cause_suppress", check(causes != null && causes.contains(SymptomCause.SUPPRESS_URGES)));
            data.put("cause_work", check(causes != null && causes.contains(SymptomCause.OVEREXERTION)));
            data.put("cause_sadness", check(causes != null && causes.contains(SymptomCause.SADNESS)));
            data.put("cause_anger", check(causes != null && causes.contains(SymptomCause.ANGER)));
            data.put("cause_other", defaultStr(treatment.getCauseOfSymptomsOther()));

            // การวินิจฉัย
            data.put("summaryOfSickness", defaultStr(treatment.getSummaryOfSickness()));
            data.put("diagnosisElements", defaultStr(treatment.getDiagnosisElements()));
            data.put("ttmDiagnosis", defaultStr(treatment.getTtmDiagnosis()));
            data.put("modernDiagnosis", defaultStr(treatment.getModernDiagnosis()));
            data.put("additionalSymptoms", defaultStr(treatment.getAdditionalSymptoms()));

            // แผนการรักษา & โปรแกรม
            data.put("treatmentPlan", defaultStr(treatment.getTreatmentPlan()));
            data.put("treatmentProgram", defaultStr(treatment.getTreatmentProgram()));
            data.put("treatmentProgramMassageDetails", defaultStr(treatment.getTreatmentProgramMassageDetails()));
            data.put("treatmentProgramOther", defaultStr(treatment.getTreatmentProgramOther()));

            // โปรแกรมการรักษา Checkboxes
            Set<TreatmentProgramType> progs = treatment.getTreatmentPrograms();
            data.put("prog_massage", check(progs != null && progs.contains(TreatmentProgramType.MASSAGE)));
            data.put("prog_compress", check(progs != null && progs.contains(TreatmentProgramType.HERBAL_COMPRESS)));
            data.put("prog_steam", check(progs != null && progs.contains(TreatmentProgramType.HERBAL_STEAM)));
            data.put("prog_herbal_med", check(progs != null && progs.contains(TreatmentProgramType.HERBAL_MEDICINE)));
            data.put("prog_consult", check(progs != null && progs.contains(TreatmentProgramType.CONSULTATION)));
            data.put("prog_other", check(progs != null && progs.contains(TreatmentProgramType.OTHER)));

            // ประเมินผลหลังการรักษา & คำแนะนำ
            data.put("evalAfterTreatment", defaultStr(treatment.getEvalAfterTreatment()));
            data.put("suggestions", defaultStr(treatment.getSuggestions()));
            data.put("followup", defaultStr(treatment.getFollowup()));
            data.put("painScoreBefore",
                    treatment.getPainScoreBefore() != null ? String.valueOf(treatment.getPainScoreBefore()) : "");
            data.put("painScoreAfter",
                    treatment.getPainScoreAfter() != null ? String.valueOf(treatment.getPainScoreAfter()) : "");

            // แพทย์ผู้ตรวจ
            Doctor doctor = treatment.getDoctor();
            if (doctor != null) {
                data.put("doctorName", defaultStr(doctor.getFullname()));
                data.put("doctorLicenseNo", defaultStr(doctor.getPhysicianLicenseNo()));
            } else {
                data.put("doctorName", "");
                data.put("doctorLicenseNo", "");
            }

            // ==========================================
            // 5. ตารางสั่งการรักษา / ใบสั่งยา (หน้า 5)
            // ==========================================
            List<Map<String, Object>> items = new ArrayList<>();
            double grandTotal = 0.0;
            if (treatment.getRecordTreatmentMedicines() != null) {
                for (RecordTreatmentMedicine rtm : treatment.getRecordTreatmentMedicines()) {
                    Map<String, Object> item = new HashMap<>();
                    String medName = rtm.getMedicine() != null ? rtm.getMedicine().getMedicineName() : "ยาแผนไทย";
                    double unitPrice = (rtm.getMedicine() != null && rtm.getMedicine().getUnitPrice() != null)
                            ? rtm.getMedicine().getUnitPrice()
                            : 0.0;
                    int qty = rtm.getQuantity() != null ? rtm.getQuantity() : 1;
                    double total = unitPrice * qty;
                    grandTotal += total;

                    item.put("name", medName);
                    item.put("price", String.format(Locale.US, "%.2f", unitPrice));
                    item.put("qty", String.valueOf(qty));
                    item.put("total", String.format(Locale.US, "%.2f", total));
                    items.add(item);
                }
            }
            // ค่าบริการ / หัตถการ จาก Receipt
            if (treatment.getReceipt() != null && treatment.getReceipt().getAdditionalItems() != null) {
                for (ReceiptItem ri : treatment.getReceipt().getAdditionalItems()) {
                    Map<String, Object> item = new HashMap<>();
                    double amount = ri.getAmount() != null ? ri.getAmount() : 0.0;
                    grandTotal += amount;

                    item.put("name", ri.getItemName());
                    item.put("price", String.format(Locale.US, "%.2f", amount));
                    item.put("qty", "1");
                    item.put("total", String.format(Locale.US, "%.2f", amount));
                    items.add(item);
                }
            }

            data.put("items", items);
            data.put("grandTotal", String.format(Locale.US, "%.2f", grandTotal));

            // สิทธิการรักษา (หน้า 5)
            TreatmentRights rights = patient.getTreatmentRights();
            data.put("pay_direct", check(rights == TreatmentRights.PAY_DIRECT));
            data.put("pay_free", check(rights != null && rights != TreatmentRights.PAY_DIRECT));
            data.put("pay_special", check(rights == TreatmentRights.ELDERLY || rights == TreatmentRights.MONK
                    || rights == TreatmentRights.DISABLED));
            data.put("pay_other", check(rights == TreatmentRights.OTHER));
        } else {
            fillTreatmentDefaults(data);
        }

        return data;
    }

    private byte[] renderTemplate(String templateClasspathLocation, Map<String, Object> data) {
        ClassPathResource resource = new ClassPathResource(templateClasspathLocation);
        if (!resource.exists()) {
            // Fallback to check if file has double extension (.docx.docx)
            ClassPathResource fallbackResource = new ClassPathResource(templateClasspathLocation + ".docx");
            if (fallbackResource.exists()) {
                resource = fallbackResource;
            } else {
                throw new ResourceNotFoundException("Word template file not found: " + templateClasspathLocation
                        + ". Please place your template in backend/src/main/resources/" + templateClasspathLocation);
            }
        }

        LoopRowTableRenderPolicy policy = new LoopRowTableRenderPolicy("[", "]", true);
        Configure config = Configure.builder()
                .bind("items", policy)
                .build();

        try (InputStream inputStream = resource.getInputStream();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XWPFTemplate template = XWPFTemplate.compile(inputStream, config).render(data);
            template.write(out);
            template.close();
            return out.toByteArray();

        } catch (IOException e) {
            log.error("Failed to render Word template: {}", templateClasspathLocation, e);
            throw new RuntimeException("Error rendering document template: " + e.getMessage(), e);
        }
    }

    private String check(boolean condition) {
        return condition ? CHECKED : UNCHECKED;
    }

    private String defaultStr(String val) {
        return val != null ? val : "";
    }

    private void fillPrincipleDefaults(Map<String, Object> data) {
        data.put("pd_earth", UNCHECKED);
        data.put("pd_water", UNCHECKED);
        data.put("pd_air", UNCHECKED);
        data.put("pd_fire", UNCHECKED);
        data.put("sd_earth", UNCHECKED);
        data.put("sd_water", UNCHECKED);
        data.put("sd_air", UNCHECKED);
        data.put("sd_fire", UNCHECKED);
        data.put("cd_earth", UNCHECKED);
        data.put("cd_water", UNCHECKED);
        data.put("cd_air", UNCHECKED);
        data.put("cd_fire", UNCHECKED);
        data.put("cc_semha", UNCHECKED);
        data.put("cc_vata", UNCHECKED);
        data.put("cc_pitta", UNCHECKED);
        data.put("so_semha", UNCHECKED);
        data.put("so_vata", UNCHECKED);
        data.put("so_pitta", UNCHECKED);
        data.put("sc_semha", UNCHECKED);
        data.put("sc_vata", UNCHECKED);
        data.put("sc_pitta", UNCHECKED);
        data.put("age_child", UNCHECKED);
        data.put("age_adult", UNCHECKED);
        data.put("age_aging", UNCHECKED);
        data.put("to_semha", UNCHECKED);
        data.put("to_vata", UNCHECKED);
        data.put("to_pitta", UNCHECKED);
        data.put("tc_semha", UNCHECKED);
        data.put("tc_vata", UNCHECKED);
        data.put("tc_pitta", UNCHECKED);
        data.put("gb_earth", UNCHECKED);
        data.put("gb_water", UNCHECKED);
        data.put("gb_air", UNCHECKED);
        data.put("gb_fire", UNCHECKED);
        data.put("gc_earth", UNCHECKED);
        data.put("gc_water", UNCHECKED);
        data.put("gc_air", UNCHECKED);
        data.put("gc_fire", UNCHECKED);
    }

    private void fillHealthDefaults(Map<String, Object> data) {
        data.put("presentHistory", "");
        data.put("dis_deny", UNCHECKED);
        data.put("dis_have", UNCHECKED);
        data.put("diseaseDetail", "");
        data.put("drug_deny", UNCHECKED);
        data.put("drug_have", UNCHECKED);
        data.put("drugAllergyDetail", "");
        data.put("food_deny", UNCHECKED);
        data.put("food_have", UNCHECKED);
        data.put("foodAllergyDetail", "");
        data.put("fam_deny", UNCHECKED);
        data.put("fam_have", UNCHECKED);
        data.put("alcohol_deny", UNCHECKED);
        data.put("alcohol_have", UNCHECKED);
        data.put("smoke_deny", UNCHECKED);
        data.put("smoke_have", UNCHECKED);
        data.put("menstruationHistory", "");
    }

    private void fillTreatmentDefaults(Map<String, Object> data) {
        data.put("visitDate", "");
        data.put("visitTime", "");
        data.put("symptoms", "");
        data.put("temp", "");
        data.put("pulse", "");
        data.put("respirationRate", "");
        data.put("bp", "");
        data.put("height", "");
        data.put("weight", "");
        data.put("bmi", "");
        data.put("bicepRt", "");
        data.put("bicepLt", "");
        data.put("tricepsRt", "");
        data.put("tricepsLt", "");
        data.put("kneeRt", "");
        data.put("kneeLt", "");
        data.put("ankleRt", "");
        data.put("ankleLt", "");
        data.put("cause_food", UNCHECKED);
        data.put("cause_posture", UNCHECKED);
        data.put("cause_weather", UNCHECKED);
        data.put("cause_fasting", UNCHECKED);
        data.put("cause_suppress", UNCHECKED);
        data.put("cause_work", UNCHECKED);
        data.put("cause_sadness", UNCHECKED);
        data.put("cause_anger", UNCHECKED);
        data.put("cause_other", "");
        data.put("summaryOfSickness", "");
        data.put("diagnosisElements", "");
        data.put("ttmDiagnosis", "");
        data.put("modernDiagnosis", "");
        data.put("additionalSymptoms", "");
        data.put("treatmentPlan", "");
        data.put("treatmentProgram", "");
        data.put("treatmentProgramMassageDetails", "");
        data.put("treatmentProgramOther", "");
        data.put("prog_massage", UNCHECKED);
        data.put("prog_compress", UNCHECKED);
        data.put("prog_steam", UNCHECKED);
        data.put("prog_herbal_med", UNCHECKED);
        data.put("prog_consult", UNCHECKED);
        data.put("prog_other", UNCHECKED);
        data.put("evalAfterTreatment", "");
        data.put("suggestions", "");
        data.put("followup", "");
        data.put("painScoreBefore", "");
        data.put("painScoreAfter", "");
        data.put("doctorName", "");
        data.put("doctorLicenseNo", "");
        data.put("items", Collections.emptyList());
        data.put("grandTotal", "0.00");
        data.put("pay_direct", UNCHECKED);
        data.put("pay_free", UNCHECKED);
        data.put("pay_special", UNCHECKED);
        data.put("pay_other", UNCHECKED);
    }
}
