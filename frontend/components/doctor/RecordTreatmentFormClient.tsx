"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  AppointmentResponseDTO,
  PatientResponseDTO,
  MedicineResponseDTO,
  RecordTreatmentRequestDTO,
  RecordTreatmentResponseDTO,
  Dhatu,
  TriDosha,
  AgePrinciple,
  SymptomCause,
} from "@/lib/types";

export const DHATU_OPTIONS: { value: Dhatu; label: string; sub: string }[] = [
  { value: "PATHAVI", label: "ปถวี (ดิน)", sub: "Pathavi" },
  { value: "APO", label: "อาโป (น้ำ)", sub: "Apo" },
  { value: "VAYO", label: "วาโย (ลม)", sub: "Vayo" },
  { value: "TECHO", label: "เตโช (ไฟ)", sub: "Techo" },
];

export const TRIDOSHA_OPTIONS: { value: TriDosha; label: string; sub: string }[] = [
  { value: "SEMHA", label: "เสมหะ", sub: "Semha (Kapha)" },
  { value: "VATA", label: "วาตะ", sub: "Vata" },
  { value: "PITTA", label: "ปิตตะ", sub: "Pitta" },
];

export const AGE_OPTIONS: { value: AgePrinciple; label: string; sub: string }[] = [
  { value: "CHILD", label: "ปฐมวัย", sub: "วัยเด็ก (0-16 ปี)" },
  { value: "ADULT", label: "มัชฌิมวัย", sub: "วัยผู้ใหญ่ (16-32 ปี)" },
  { value: "AGING", label: "ปัจฉิมวัย", sub: "วัยสูงอายุ (32 ปีขึ้นไป)" },
];

export const SYMPTOM_CAUSE_OPTIONS: { value: SymptomCause; label: string; sub: string }[] = [
  { value: "FOOD", label: "อาหาร", sub: "Food" },
  { value: "POSTURE", label: "อิริยาบถ", sub: "Position/Posture" },
  { value: "WEATHER", label: "ความร้อน-ความเย็น", sub: "Weather/Temperature" },
  { value: "FASTING_LACK_SLEEP", label: "อดนอน อดข้าว อดน้ำ", sub: "Fasting & lack of sleep" },
  { value: "SUPPRESS_URGES", label: "กลั้นอุจจาระปัสสาวะ", sub: "Incontinence feces & urinary" },
  { value: "OVEREXERTION", label: "ทำงานเกินกำลัง", sub: "Work hard/Overexertion" },
  { value: "SADNESS", label: "ความเศร้าโศกเสียใจ", sub: "Sadness" },
  { value: "ANGER", label: "ความโกรธ", sub: "Wrath/Anger" },
  { value: "OTHER", label: "อื่นๆ", sub: "Other" },
];

interface RecordTreatmentFormClientProps {
  doctorId: number;
  doctorFullname: string;
  defaultAppointmentId?: number;
  defaultPatientId?: number;
  appointments: AppointmentResponseDTO[];
  patients: PatientResponseDTO[];
  medicines: MedicineResponseDTO[];
  existingTreatments: RecordTreatmentResponseDTO[];
}

interface PrescribedItem {
  medicineId: number;
  medicineName: string;
  unitPrice: number;
  quantity: number;
  unitType?: string;
  subTotal: number;
  dosageInstructions?: string;
}

const PAIN_SCORES = [
  { score: 0, label: "ไม่ปวด", emoji: "😊", desc: "No pain" },
  { score: 2, label: "ปวดเล็กน้อย", emoji: "🙂", desc: "Mild" },
  { score: 4, label: "ปวดปานกลาง", emoji: "😐", desc: "Moderate" },
  { score: 6, label: "ปวดมาก", emoji: "🙁", desc: "Severe" },
  { score: 8, label: "ปวดรุนแรง", emoji: "😣", desc: "Very severe" },
  { score: 10, label: "ปวดมากที่สุดที่ทนได้", emoji: "😭", desc: "Worst possible" },
];

export function RecordTreatmentFormClient({
  doctorId,
  doctorFullname,
  defaultAppointmentId,
  defaultPatientId,
  appointments,
  patients,
  medicines,
  existingTreatments,
}: RecordTreatmentFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Set of appointment IDs that already have a treatment record
  const treatedAppointmentIds = useMemo(() => {
    return new Set(existingTreatments.map((t) => t.appointmentId));
  }, [existingTreatments]);

  // Find if defaultAppointmentId already has a record
  const alreadyTreatedRecord = useMemo(() => {
    if (!defaultAppointmentId) return null;
    return existingTreatments.find((t) => t.appointmentId === defaultAppointmentId) || null;
  }, [defaultAppointmentId, existingTreatments]);

  // Filter available appointments for selection (only untreated appointments)
  const availableAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.status === "SCHEDULED" && !treatedAppointmentIds.has(a.appointmentId)
    );
  }, [appointments, treatedAppointmentIds]);

  // Initial selection
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | "WALK_IN">(() => {
    if (defaultAppointmentId && !treatedAppointmentIds.has(defaultAppointmentId)) {
      return defaultAppointmentId;
    }
    return "WALK_IN";
  });

  const [selectedPatientId, setSelectedPatientId] = useState<number>(() => {
    if (defaultPatientId) return defaultPatientId;
    if (defaultAppointmentId) {
      const app = appointments.find((a) => a.appointmentId === defaultAppointmentId);
      if (app) return app.patientId;
    }
    if (availableAppointments.length > 0 && selectedAppointmentId !== "WALK_IN") {
      const app = availableAppointments.find((a) => a.appointmentId === selectedAppointmentId);
      if (app) return app.patientId;
    }
    return patients.length > 0 ? patients[0].patientId : 0;
  });

  // Patient previous history & auto mode detection
  const [patientHistory, setPatientHistory] = useState<RecordTreatmentResponseDTO[]>([]);
  const [formMode, setFormMode] = useState<"FIRST_VISIT" | "CONTINUED_VISIT">("FIRST_VISIT");

  // Selected patient object
  const currentPatient = useMemo(() => {
    return patients.find((p) => p.patientId === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // ==========================================
  // FORM FIELDS MIRRORING PDF PAGES 1 TO 5
  // ==========================================

  // Header Context
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [visitTime, setVisitTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  // Symptoms & Present History
  const [symptoms, setSymptoms] = useState("");
  const [presentHistory, setPresentHistory] = useState("");

  // Past History (ประวัติอดีต)
  const [hasUnderlyingDisease, setHasUnderlyingDisease] = useState<boolean>(false);
  const [underlyingDiseaseDetails, setUnderlyingDiseaseDetails] = useState("");

  const [hasDrugAllergy, setHasDrugAllergy] = useState<boolean>(false);
  const [drugAllergyDetails, setDrugAllergyDetails] = useState("");

  const [hasFoodAllergy, setHasFoodAllergy] = useState<boolean>(false);
  const [foodAllergyDetails, setFoodAllergyDetails] = useState("");

  // Family History (ประวัติครอบครัว)
  const [hasFamilyDisease, setHasFamilyDisease] = useState<boolean>(false);
  const [familyDiseaseDetails, setFamilyDiseaseDetails] = useState("");

  // Personal History (ประวัติส่วนตัว)
  const [drinksAlcohol, setDrinksAlcohol] = useState<boolean>(false);
  const [smokes, setSmokes] = useState<boolean>(false);

  // PART 3: Physical Examination & Pain Assessment
  const [temp, setTemp] = useState<number | "">(36.5);
  const [pulse, setPulse] = useState<number | "">(76);
  const [respirationRate, setRespirationRate] = useState<number | "">(18);
  const [bp, setBp] = useState("120/80");
  const [height, setHeight] = useState<number | "">(165);
  const [weight, setWeight] = useState<number | "">(60);
  const [painScoreBefore, setPainScoreBefore] = useState<number>(4);
  const [painScoreAfter, setPainScoreAfter] = useState<number>(2);

  // Modern Medical Diagnosis & Additional Symptoms
  const [modernDiagnosis, setModernDiagnosis] = useState("");
  const [additionalSymptoms, setAdditionalSymptoms] = useState("");

  // Reflexes (Bicep, Triceps, Knee, Ankle RT/LT)
  const [bicepRT, setBicepRT] = useState("2+");
  const [bicepLT, setBicepLT] = useState("2+");
  const [tricepsRT, setTricepsRT] = useState("2+");
  const [tricepsLT, setTricepsLT] = useState("2+");
  const [kneeRT, setKneeRT] = useState("2+");
  const [kneeLT, setKneeLT] = useState("2+");
  const [ankleRT, setAnkleRT] = useState("2+");
  const [ankleLT, setAnkleLT] = useState("2+");

  // Menstruation History
  const [menstruationHistory, setMenstruationHistory] = useState("ปกติ ไม่ปวดประจำเดือน");

  // PART 2 & PART 4: DhatuPrinciple (ธาตุสมุฏฐาน 5 ด้าน & ธาตุเจ้าเรือน)
  const [principalDhatu, setPrincipalDhatu] = useState<Dhatu>("PATHAVI");
  const [secondaryDhatu, setSecondaryDhatu] = useState<Dhatu>("VAYO");
  const [conceptionDhatu, setConceptionDhatu] = useState<Dhatu>("PATHAVI");
  const [conceptionCharacteristic, setConceptionCharacteristic] = useState<TriDosha>("VATA");
  const [seasonalOnset, setSeasonalOnset] = useState<TriDosha>("SEMHA");
  const [seasonalCurrent, setSeasonalCurrent] = useState<TriDosha>("VATA");
  const [agePrinciple, setAgePrinciple] = useState<AgePrinciple>("ADULT");
  const [timeOnset, setTimeOnset] = useState<TriDosha>("PITTA");
  const [timeCurrent, setTimeCurrent] = useState<TriDosha>("VATA");
  const [geoBirthplace, setGeoBirthplace] = useState<Dhatu>("PATHAVI");
  const [geoCurrent, setGeoCurrent] = useState<Dhatu>("VAYO");

  // มูลเหตุการเกิดโรค (Cause of symptoms Checkboxes)
  const [causeFood, setCauseFood] = useState(false);
  const [causePosition, setCausePosition] = useState(true);
  const [causeWeather, setCauseWeather] = useState(false);
  const [causeFastingSleep, setCauseFastingSleep] = useState(false);
  const [causeIncontinence, setCauseIncontinence] = useState(false);
  const [causeWorkHard, setCauseWorkHard] = useState(true);
  const [causeSadness, setCauseSadness] = useState(false);
  const [causeWrath, setCauseWrath] = useState(false);
  const [causeOther, setCauseOther] = useState("");

  // Summary of Sickness & TTM Diagnosis
  const [summaryOfSickness, setSummaryOfSickness] = useState("");
  const [diagnosisElements, setDiagnosisElements] = useState("วาตะกำเริบ ส่งผลให้เกิดอาการตึงตัวของกล้ามเนื้อบ่าและสะบัก");
  const [ttmDiagnosis, setTtmDiagnosis] = useState("โรคลมปลายปัตฆาตสัญญาณ 4-5");

  // PART 5: Treatment Plan & Program
  const [treatmentPlan, setTreatmentPlan] = useState("นวดรักษาและประคบสมุนไพรเพื่อคลายกล้ามเนื้อ");
  const [programCompress, setProgramCompress] = useState(true);
  const [programSteam, setProgramSteam] = useState(false);
  const [programHerbalMed, setProgramHerbalMed] = useState(true);
  const [programMassage, setProgramMassage] = useState(true);
  const [programMassageDetails, setProgramMassageDetails] = useState("นวดแก้อาการบริเวณสะบัก บ่า และต้นคอ");
  const [programConsult, setProgramConsult] = useState(true);

  const [evalAfterTreatment, setEvalAfterTreatment] = useState("กล้ามเนื้อบ่าคลายตัวลง ความตึงลดลง ผู้ป่วยรู้สึกสบายขึ้น");
  const [suggestions, setSuggestions] = useState("หลีกเลี่ยงการยกของหนัก ปรับท่านั่งทำงาน และประคบอุ่นบริเวณที่ปวด");
  const [followup, setFollowup] = useState("นัดติดตามผลการรักษาในอีก 1 สัปดาห์");

  // PART 6: Billing & Prescriptions
  const [medicalRights, setMedicalRights] = useState<"PAY" | "FREE_ELDER" | "FREE_OTHER">("PAY");
  const [medicalRightsOther, setMedicalRightsOther] = useState("");
  const [procedureFee, setProcedureFee] = useState<number>(300);
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PENDING">("PAID");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<number>(
    medicines.length > 0 ? medicines[0].medicineId : 0
  );
  const [medQuantity, setMedQuantity] = useState<number>(1);
  const [medDosage, setMedDosage] = useState("รับประทานครั้งละ 2 แคปซูล หลังอาหาร เช้า-เย็น");

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto calculate BMI
  const bmiValue = useMemo(() => {
    if (!height || !weight || Number(height) <= 0 || Number(weight) <= 0) return null;
    const hMeters = Number(height) / 100;
    const val = Number(weight) / (hMeters * hMeters);
    return Math.round(val * 10) / 10;
  }, [height, weight]);

  const bmiClassification = useMemo(() => {
    if (!bmiValue) return null;
    if (bmiValue < 18.5) return { label: "น้ำหนักน้อยกว่าเกณฑ์", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (bmiValue <= 22.9) return { label: "สมส่วน / ปกติ", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (bmiValue <= 24.9) return { label: "ท้วม / น้ำหนักเกิน", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (bmiValue <= 29.9) return { label: "อ้วนระดับ 1", color: "text-orange-700 bg-orange-50 border-orange-200" };
    return { label: "อ้วนระดับ 2 (อันตราย)", color: "text-red-700 bg-red-50 border-red-300" };
  }, [bmiValue]);

  // Appointment change
  const handleAppointmentChange = (val: string) => {
    if (val === "WALK_IN") {
      setSelectedAppointmentId("WALK_IN");
    } else {
      const appId = Number(val);
      setSelectedAppointmentId(appId);
      const app = availableAppointments.find((a) => a.appointmentId === appId);
      if (app && app.patientId) {
        setSelectedPatientId(app.patientId);
      }
    }
  };

  // Fetch patient previous treatment records and latest health profile for pre-filling
  useEffect(() => {
    if (!selectedPatientId) return;
    let isMounted = true;

    // 1. Fetch patient treatment history
    fetch(`/api/record-treatments/patient/${selectedPatientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const list: RecordTreatmentResponseDTO[] = data?.content || data?.data || [];
        setPatientHistory(list);

        // Auto mode toggle based on past records
        if (list.length > 0) {
          setFormMode("CONTINUED_VISIT");
          const latest = list[0];
          if (latest.ttmDiagnosis) setTtmDiagnosis(latest.ttmDiagnosis);
          if (latest.treatmentPlan) setTreatmentPlan(latest.treatmentPlan);
        } else {
          setFormMode("FIRST_VISIT");
        }
      })
      .catch(() => { });

    // 2. Fetch latest HealthProfile snapshot to pre-fill checkboxes & details
    fetch(`/api/record-treatments/patient/${selectedPatientId}/latest-health-profile`)
      .then((res) => (res.ok ? res.json() : null))
      .then((resJson) => {
        if (!isMounted) return;
        const hp = resJson?.data || resJson;
        if (!hp) return;

        if (hp.underlyingDisease) {
          const dis = hp.underlyingDisease;
          if (dis && !dis.includes("ปฏิเสธ")) {
            setHasUnderlyingDisease(true);
            setUnderlyingDiseaseDetails(dis);
          } else {
            setHasUnderlyingDisease(false);
            setUnderlyingDiseaseDetails("");
          }
        }

        if (hp.drugAllergy) {
          const drug = hp.drugAllergy;
          if (drug && !drug.includes("ปฏิเสธ")) {
            setHasDrugAllergy(true);
            setDrugAllergyDetails(drug);
          } else {
            setHasDrugAllergy(false);
            setDrugAllergyDetails("");
          }
        }

        if (hp.foodAllergy) {
          const food = hp.foodAllergy;
          if (food && !food.includes("ปฏิเสธ")) {
            setHasFoodAllergy(true);
            setFoodAllergyDetails(food);
          } else {
            setHasFoodAllergy(false);
            setFoodAllergyDetails("");
          }
        }

        if (hp.hereditaryDisease) {
          const fam = hp.hereditaryDisease;
          if (fam && !fam.includes("ปฏิเสธ")) {
            setHasFamilyDisease(true);
            setFamilyDiseaseDetails(fam);
          } else {
            setHasFamilyDisease(false);
            setFamilyDiseaseDetails("");
          }
        }

        if (hp.alcoholConsumption) {
          setDrinksAlcohol(hp.alcoholConsumption.includes("ดื่ม") && !hp.alcoholConsumption.includes("ปฏิเสธ"));
        }

        if (hp.smokingHistory) {
          setSmokes(hp.smokingHistory.includes("สูบ") && !hp.smokingHistory.includes("ปฏิเสธ"));
        }

        if (hp.menstruation) {
          setMenstruationHistory(hp.menstruation);
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, [selectedPatientId]);

  // Check if patient already has an established DhatuPrinciple
  const hasExistingDhatuPrinciple = useMemo(() => {
    return Boolean(
      currentPatient?.principle?.principalDhatu ||
      currentPatient?.principle?.conceptionDhatu ||
      currentPatient?.principle?.seasonalOnset
    );
  }, [currentPatient]);

  // Auto-fill from patient principle if available
  useEffect(() => {
    if (!currentPatient?.principle) return;
    const p = currentPatient.principle;
    if (p.principalDhatu) setPrincipalDhatu(p.principalDhatu);
    if (p.secondaryDhatu) setSecondaryDhatu(p.secondaryDhatu);
    if (p.conceptionDhatu) setConceptionDhatu(p.conceptionDhatu);
    if (p.conceptionCharacteristic) setConceptionCharacteristic(p.conceptionCharacteristic);
    if (p.seasonalOnset) setSeasonalOnset(p.seasonalOnset);
    if (p.seasonalCurrent) setSeasonalCurrent(p.seasonalCurrent);
    if (p.agePrinciple) setAgePrinciple(p.agePrinciple);
    if (p.timeOnset) setTimeOnset(p.timeOnset);
    if (p.timeCurrent) setTimeCurrent(p.timeCurrent);
    if (p.geoBirthplace) setGeoBirthplace(p.geoBirthplace);
    if (p.geoCurrent) setGeoCurrent(p.geoCurrent);
  }, [currentPatient]);

  // Medicine add / remove
  const handleAddMedicine = () => {
    if (!selectedMedId) return;
    const med = medicines.find((m) => m.medicineId === Number(selectedMedId));
    if (!med) return;

    const qty = Number(medQuantity);
    if (qty <= 0) return;

    const existingIndex = prescribedMedicines.findIndex((p) => p.medicineId === med.medicineId);
    if (existingIndex >= 0) {
      const updated = [...prescribedMedicines];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].subTotal = updated[existingIndex].quantity * med.unitPrice;
      if (medDosage) updated[existingIndex].dosageInstructions = medDosage;
      setPrescribedMedicines(updated);
    } else {
      setPrescribedMedicines((prev) => [
        ...prev,
        {
          medicineId: med.medicineId,
          medicineName: med.medicineName,
          unitPrice: med.unitPrice,
          quantity: qty,
          unitType: med.unitType ?? "หน่วย",
          subTotal: qty * med.unitPrice,
          dosageInstructions: medDosage,
        },
      ]);
    }
    setMedQuantity(1);
  };

  const handleRemoveMedicine = (medId: number) => {
    setPrescribedMedicines((prev) => prev.filter((p) => p.medicineId !== medId));
  };

  // Grand Total Calculation
  const medicinesTotal = useMemo(() => {
    return prescribedMedicines.reduce((sum, item) => sum + item.subTotal, 0);
  }, [prescribedMedicines]);

  const grandTotal = useMemo(() => {
    if (medicalRights !== "PAY") return 0;
    return medicinesTotal + Number(procedureFee || 0);
  }, [medicinesTotal, procedureFee, medicalRights]);

  // Compose Full Clinical Form Fields into DB Columns
  const composedCauseOfSymptoms = useMemo(() => {
    const list: string[] = [];
    if (causeFood) list.push("อาหาร (Food)");
    if (causePosition) list.push("อิริยาบถ (Position)");
    if (causeWeather) list.push("ความร้อน-ความเย็น (Local weather: hot-cold)");
    if (causeFastingSleep) list.push("อดนอน อดข้าว อดน้ำ (Fasting and lack of sleep)");
    if (causeIncontinence) list.push("กลั้นอุจจาระปัสสาวะ (Incontinence feces and urinary)");
    if (causeWorkHard) list.push("ทำงานเกินกำลัง (Work hard)");
    if (causeSadness) list.push("ความเศร้าโศกเสียใจ (Sadness)");
    if (causeWrath) list.push("ความโกรธ (Wrath)");
    if (causeOther.trim()) list.push(`อื่นๆ: ${causeOther.trim()}`);
    return list.join(", ");
  }, [
    causeFood,
    causePosition,
    causeWeather,
    causeFastingSleep,
    causeIncontinence,
    causeWorkHard,
    causeSadness,
    causeWrath,
    causeOther,
  ]);

  const composedDiagnosisElements = useMemo(() => {
    const formatDhatu = (d?: Dhatu | null) => DHATU_OPTIONS.find((o) => o.value === d)?.label || d || "-";
    const formatDosha = (t?: TriDosha | null) => TRIDOSHA_OPTIONS.find((o) => o.value === t)?.label || t || "-";
    const formatAge = (a?: AgePrinciple | null) => AGE_OPTIONS.find((o) => o.value === a)?.label || a || "-";

    return [
      `ธาตุสมุฏฐาน: กำเนิด [${formatDhatu(conceptionDhatu)}], ลักษณะ [${formatDosha(conceptionCharacteristic)}]`,
      `อุตุสมุฏฐาน: เริ่มป่วย [${formatDosha(seasonalOnset)}], พบแพทย์ [${formatDosha(seasonalCurrent)}]`,
      `อายุสมุฏฐาน: [${formatAge(agePrinciple)}]`,
      `กาลสมุฏฐาน: กำเริบ [${formatDosha(timeOnset)}], พบแพทย์ [${formatDosha(timeCurrent)}]`,
      `ประเทศสมุฏฐาน: ภูมิลำเนา [${formatDhatu(geoBirthplace)}], ปัจจุบัน [${formatDhatu(geoCurrent)}]`,
      diagnosisElements ? `สมุฏฐานธาตุพิการ: ${diagnosisElements}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  }, [
    conceptionDhatu,
    conceptionCharacteristic,
    seasonalOnset,
    seasonalCurrent,
    agePrinciple,
    timeOnset,
    timeCurrent,
    geoBirthplace,
    geoCurrent,
    diagnosisElements,
  ]);

  const composedTreatmentProgram = useMemo(() => {
    const progs: string[] = [];
    if (programMassage) progs.push(`นวด/หัตถการ (${programMassageDetails || "หัตถการเฉพาะจุด"})`);
    if (programCompress) progs.push("ประคบสมุนไพร (Herbal compress)");
    if (programSteam) progs.push("อบสมุนไพร (Herbal steam)");
    if (programHerbalMed) progs.push("จ่ายยาสมุนไพร (Herbal medicine)");
    if (programConsult) progs.push("ให้คำปรึกษาทางการแพทย์");
    return progs.join(", ");
  }, [
    programCompress,
    programSteam,
    programHerbalMed,
    programMassage,
    programMassageDetails,
    programConsult,
  ]);

  const composedModernDiagnosis = useMemo(() => {
    const parts: string[] = [];
    if (modernDiagnosis.trim()) parts.push(modernDiagnosis.trim());
    if (additionalSymptoms.trim()) parts.push(`อาการเพิ่มเติม: ${additionalSymptoms.trim()}`);
    return parts.join(" | ");
  }, [modernDiagnosis, additionalSymptoms]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedPatientId) {
      setErrorMsg("กรุณาเลือกผู้ป่วยที่เข้ารับการตรวจรักษา");
      return;
    }

    if (!symptoms.trim()) {
      setErrorMsg("กรุณาระบุอาการสำคัญ (Symptoms/Condition)");
      return;
    }

    try {
      const recordDateObj = visitDate ? new Date(`${visitDate}T${visitTime || "00:00"}:00`) : new Date();
      const validRecordDateIso = isNaN(recordDateObj.getTime()) ? new Date().toISOString() : recordDateObj.toISOString();

      const treatmentDTO: RecordTreatmentRequestDTO = {
        appointmentId: selectedAppointmentId === "WALK_IN" ? undefined : selectedAppointmentId,
        patientId: selectedPatientId,
        doctorId: Number(doctorId) || 1,
        recordDate: validRecordDateIso,
        symptoms: presentHistory.trim()
          ? `${symptoms.trim()}\n[ประวัติปัจจุบัน]: ${presentHistory.trim()}`
          : symptoms.trim(),
        temp: temp ? Number(temp) : undefined,
        pulse: pulse ? Number(pulse) : undefined,
        respirationRate: respirationRate ? Number(respirationRate) : undefined,
        bp: bp.trim() || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        bmi: bmiValue ? Number(bmiValue) : undefined,
        bicepRt: bicepRT.trim() || undefined,
        bicepLt: bicepLT.trim() || undefined,
        tricepsRt: tricepsRT.trim() || undefined,
        tricepsLt: tricepsLT.trim() || undefined,
        kneeRt: kneeRT.trim() || undefined,
        kneeLt: kneeLT.trim() || undefined,
        ankleRt: ankleRT.trim() || undefined,
        ankleLt: ankleLT.trim() || undefined,
        causesOfSymptoms: [
          ...(causeFood ? ["FOOD" as SymptomCause] : []),
          ...(causePosition ? ["POSTURE" as SymptomCause] : []),
          ...(causeWeather ? ["WEATHER" as SymptomCause] : []),
          ...(causeFastingSleep ? ["FASTING_LACK_SLEEP" as SymptomCause] : []),
          ...(causeIncontinence ? ["SUPPRESS_URGES" as SymptomCause] : []),
          ...(causeWorkHard ? ["OVEREXERTION" as SymptomCause] : []),
          ...(causeSadness ? ["SADNESS" as SymptomCause] : []),
          ...(causeWrath ? ["ANGER" as SymptomCause] : []),
          ...(causeOther.trim() ? ["OTHER" as SymptomCause] : []),
        ],
        causeOfSymptomsOther: causeOther.trim() || undefined,
        summaryOfSickness: summaryOfSickness.trim() || undefined,
        diagnosisElements: diagnosisElements.trim() || undefined,
        ttmDiagnosis: ttmDiagnosis.trim() || undefined,
        modernDiagnosis: composedModernDiagnosis || undefined,
        treatmentPlan: treatmentPlan.trim() || undefined,
        treatmentProgram: composedTreatmentProgram || undefined,
        suggestions: evalAfterTreatment.trim()
          ? `[ประเมินหลังรักษา]: ${evalAfterTreatment.trim()} | [คำแนะนำ]: ${suggestions.trim()}`
          : suggestions.trim() || undefined,
        followup: followup.trim() || undefined,
        painScoreBefore: painScoreBefore,
        painScoreAfter: painScoreAfter,
        principle: (!hasExistingDhatuPrinciple || formMode === "FIRST_VISIT") ? {
          principalDhatu,
          secondaryDhatu,
          conceptionDhatu,
          conceptionCharacteristic,
          seasonalOnset,
          seasonalCurrent,
          agePrinciple,
          timeOnset,
          timeCurrent,
          geoBirthplace,
          geoCurrent,
        } : undefined,
        healthProfile: {
          presentHistory: presentHistory.trim() || undefined,
          underlyingDisease: hasUnderlyingDisease ? underlyingDiseaseDetails : "ปฏิเสธโรคประจำตัว",
          drugAllergy: hasDrugAllergy ? drugAllergyDetails : "ปฏิเสธการแพ้ยา",
          foodAllergy: hasFoodAllergy ? foodAllergyDetails : "ปฏิเสธการแพ้อาหาร",
          hereditaryDisease: hasFamilyDisease ? familyDiseaseDetails : "ครอบครัวปฏิเสธโรคทางพันธุกรรม",
          alcoholConsumption: drinksAlcohol ? "ดื่มแอลกอฮอล์" : "ปฏิเสธการดื่มแอลกอฮอล์",
          smokingHistory: smokes ? "สูบบุหรี่" : "ปฏิเสธการสูบบุหรี่",
          menstruation: menstruationHistory.trim() || undefined,
          personalHistory: (drinksAlcohol || smokes) ? "มีประวัติดื่มแอลกอฮอล์หรือสูบบุหรี่" : "ปฏิเสธการดื่มแอลกอฮอล์ และปฏิเสธการสูบบุหรี่",
        },
      };

      // 1. Create Treatment Record
      const res = await fetch("/api/record-treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(treatmentDTO),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "ไม่สามารถบันทึกเวชระเบียนการรักษาได้");
      }

      const createdRecord: RecordTreatmentResponseDTO = await res.json();
      const recordTreatmentId = createdRecord.recordTreatmentId;

      // 2. Dispense Prescribed Medicines
      for (const item of prescribedMedicines) {
        await fetch("/api/record-treatment-medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordTreatmentId: recordTreatmentId,
            medicineId: item.medicineId,
            quantity: item.quantity,
          }),
        }).catch((err) => console.error("Medicine dispensing error:", err));
      }

      // 3. Issue Receipt & Billing
      if (grandTotal > 0 || medicalRights !== "PAY") {
        await fetch("/api/receipts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordTreatmentId: recordTreatmentId,
            receiptDate: visitDate ? `${visitDate}T${visitTime}:00` : new Date().toISOString(),
            paymentStatus: medicalRights !== "PAY" ? "PAID" : paymentStatus,
            paymentMethod: paymentMethod,
          }),
        }).catch((err) => console.error("Receipt error:", err));
      }

      setSuccessMsg("บันทึกเวชระเบียนการตรวจรักษาและใบสั่งการรักษาเรียบร้อยแล้ว!");
      startTransition(() => {
        setTimeout(() => {
          router.push(`/doctor/treatments/${recordTreatmentId}`);
          router.refresh();
        }, 1200);
      });
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-24 font-body text-clinic-ink">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/doctor/treatments"
              className="text-xs font-semibold text-clinic-primary hover:underline"
            >
              ← กลับไปรายการการรักษา
            </Link>
          </div>
          <h1 className="font-display text-2xl font-bold text-clinic-primary-deep mt-1 flex items-center gap-2">
            <span>แบบบันทึกข้อมูลผู้รับบริการ (Client Intake & Treatment Record)</span>
          </h1>
          <p className="text-xs text-clinic-ink-soft mt-0.5">
            พิมพ์วิมานคลินิกการแพทย์แผนไทย Pimvimaan Thai Traditional Clinic · แพทย์ผู้ตรวจ: <strong>{doctorFullname}</strong>
          </p>
        </div>

        {/* Form Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-clinic-bg rounded-control border border-clinic-line">
          <button
            type="button"
            onClick={() => setFormMode("FIRST_VISIT")}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-all cursor-pointer ${formMode === "FIRST_VISIT"
                ? "bg-clinic-primary text-white shadow-2xs"
                : "text-clinic-ink-soft hover:text-clinic-ink"
              }`}
          >
            🌿 ตรวจรักษาครั้งแรก (Full Intake)
          </button>
          <button
            type="button"
            onClick={() => setFormMode("CONTINUED_VISIT")}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-all cursor-pointer ${formMode === "CONTINUED_VISIT"
                ? "bg-clinic-primary text-white shadow-2xs"
                : "text-clinic-ink-soft hover:text-clinic-ink"
              }`}
          >
            📋 แบบบันทึกการรักษาต่อเนื่อง (Page 6)
          </button>
        </div>
      </div>

      {/* Alert if appointment is already treated */}
      {alreadyTreatedRecord && (
        <div className="p-4 rounded-control bg-amber-50 border border-amber-300 text-amber-900 text-sm font-medium flex items-center justify-between">
          <span>
            ⚠️ นัดหมาย #{alreadyTreatedRecord.appointmentId} มีบันทึกการรักษาอยู่แล้ว (เวชระเบียน #{alreadyTreatedRecord.recordTreatmentId})
          </span>
          <Link
            href={`/doctor/treatments/${alreadyTreatedRecord.recordTreatmentId}`}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded text-xs font-bold text-amber-900 ml-2"
          >
            ดูหรือแก้ไขเวชระเบียนเดิม
          </Link>
        </div>
      )}

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline ml-2 cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-control bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <span>✅ {successMsg}</span>
        </div>
      )}

      {/* =========================================================
          SECTION 1: ข้อมูลผู้รับบริการ & นัดหมาย (Part 1 Personal Info)
          ========================================================= */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>ส่วนที่ ๑: ข้อมูลทั่วไป (Personal Information) & รายการนัดหมาย</span>
          </h2>
          {patientHistory.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              เคสต่อเนื่อง: เคยรับการรักษาแล้ว {patientHistory.length} ครั้ง
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Select Appointment */}
          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              รายการนัดหมาย
            </label>
            <select
              value={selectedAppointmentId}
              onChange={(e) => handleAppointmentChange(e.target.value)}
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40 focus:ring-2 focus:ring-clinic-primary"
            >
              <option value="WALK_IN">🚶 ผู้ป่วย Walk-in (บันทึกโดยตรง/สร้างนัดหมายอัตโนมัติ)</option>
              {availableAppointments.map((app) => (
                <option key={app.appointmentId} value={app.appointmentId}>
                  #{app.appointmentId} - {app.patientFullname} (
                  {new Date(app.slotStartTime).toLocaleDateString("th-TH")})
                </option>
              ))}
            </select>
          </div>

          {/* Select Patient */}
          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              ผู้ป่วย / ผู้รับบริการ <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40 focus:ring-2 focus:ring-clinic-primary"
            >
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  HN: {p.patientId} - {p.fullname} (ID: {p.idNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time of Visit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">วันที่มาพบแพทย์</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-2.5 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">เวลา (น.)</label>
              <input
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="w-full px-2.5 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40"
              />
            </div>
          </div>
        </div>

        {/* Patient Profile Card */}
        {currentPatient && (
          <div className="bg-clinic-bg/60 border border-clinic-line rounded-control p-4 text-xs space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-clinic-ink-soft">ชื่อ-สกุล:</span>{" "}
                <strong className="text-clinic-ink">{currentPatient.fullname}</strong>
              </div>
              <div>
                <span className="text-clinic-ink-soft">เพศ:</span>{" "}
                <span className="font-semibold text-clinic-ink">{currentPatient.gender || "-"}</span>
              </div>
              <div>
                <span className="text-clinic-ink-soft">เลขที่บัตร (OPD):</span>{" "}
                <strong className="text-clinic-ink font-mono">#{currentPatient.patientId}</strong>
              </div>
              <div>
                <span className="text-clinic-ink-soft">เลขประจำตัวประชาชน:</span>{" "}
                <span className="font-mono text-clinic-ink">{currentPatient.idNumber || "-"}</span>
              </div>
              <div>
                <span className="text-clinic-ink-soft">วันเกิด:</span>{" "}
                <span className="text-clinic-ink">
                  {currentPatient.dateOfBirth
                    ? new Date(currentPatient.dateOfBirth).toLocaleDateString("th-TH")
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-clinic-ink-soft">สถานภาพ:</span>{" "}
                <span className="text-clinic-ink">{currentPatient.marital || "โสด"}</span>
              </div>
              <div>
                <span className="text-clinic-ink-soft">เบอร์โทรศัพท์:</span>{" "}
                <span className="font-mono text-clinic-ink">{currentPatient.mobileNumber || "-"}</span>
              </div>
              <div>
                <span className="text-clinic-ink-soft">อาชีพ:</span>{" "}
                <span className="text-clinic-ink">{currentPatient.occupation || "-"}</span>
              </div>
            </div>
            <div className="text-[11px] text-clinic-ink-soft pt-1 border-t border-clinic-line/60">
              <span>ที่อยู่ปัจจุบัน: {currentPatient.address || "-"}</span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          SECTION 2: ประวัติการเจ็บป่วย (Part 2 General & Medical Info)
          ========================================================= */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>ส่วนที่ ๒: ประวัติการเจ็บป่วย (General and Medical Information)</span>
          </h2>
          <span className="text-xs text-clinic-ink-soft">ธาตุสมุฏฐาน & ประวัติสุขภาพ</span>
        </div>

        {/* ธาตุสมุฏฐาน (Elementary principles) Checkboxes / Radios */}
        <div className="bg-clinic-bg/40 p-4 rounded-control border border-clinic-line space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-clinic-primary-deep">
              ธาตุสมุฏฐาน (Elementary principles)
            </h3>
            {hasExistingDhatuPrinciple && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ บันทึกธาตุประจำตัวแล้ว (อ้างอิงจากเวชระเบียน)
              </span>
            )}
          </div>

          {hasExistingDhatuPrinciple && formMode === "CONTINUED_VISIT" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded border border-clinic-line text-xs">
              <div>
                <span className="text-clinic-ink-soft block text-[11px]">ธาตุเจ้าเรือนหลัก (Principal Dhatu):</span>
                <strong className="text-sm text-clinic-primary-deep">
                  {DHATU_OPTIONS.find((o) => o.value === principalDhatu)?.label || principalDhatu}
                </strong>
              </div>
              <div>
                <span className="text-clinic-ink-soft block text-[11px]">ธาตุเจ้าเรือนรอง (Secondary Dhatu):</span>
                <strong className="text-sm text-clinic-primary-deep">
                  {DHATU_OPTIONS.find((o) => o.value === secondaryDhatu)?.label || secondaryDhatu}
                </strong>
              </div>
            </div>
          ) : (
            <>
              {/* ธาตุเจ้าเรือนหลัก */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-clinic-ink">
                  ธาตุเจ้าเรือนหลัก (Principal Dhatu - chao - ruan):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {DHATU_OPTIONS.map((item) => (
                    <label
                      key={item.value}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        principalDhatu === item.value
                          ? "bg-clinic-primary text-white border-clinic-primary font-bold shadow-2xs"
                          : "bg-white border-clinic-line text-clinic-ink hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="principalDhatu"
                        value={item.value}
                        checked={principalDhatu === item.value}
                        onChange={() => setPrincipalDhatu(item.value)}
                        className="accent-clinic-primary"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ธาตุเจ้าเรือนรอง */}
              <div className="space-y-1.5 pt-2 border-t border-clinic-line/60">
                <label className="block text-xs font-semibold text-clinic-ink">
                  ธาตุเจ้าเรือนรอง (Secondary Dhatu - chao - ruan):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {DHATU_OPTIONS.map((item) => (
                    <label
                      key={item.value}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        secondaryDhatu === item.value
                          ? "bg-clinic-primary text-white border-clinic-primary font-bold shadow-2xs"
                          : "bg-white border-clinic-line text-clinic-ink hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="secondaryDhatu"
                        value={item.value}
                        checked={secondaryDhatu === item.value}
                        onChange={() => setSecondaryDhatu(item.value)}
                        className="accent-clinic-primary"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* อาการสำคัญ (Chief Complaint) */}
        <div>
          <label className="block text-xs font-bold text-clinic-ink mb-1">
            อาการสำคัญ (Symptoms/Condition) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="ระบุอาการสำคัญ เช่น ปวดบ่าและสะบักข้างขวา ร้าวขึ้นคอ เป็นมา 3 วัน..."
            className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary"
            required
          />
        </div>

        {/* ประวัติปัจจุบัน (Present History) */}
        <div>
          <label className="block text-xs font-semibold text-clinic-ink mb-1">
            ประวัติปัจจุบัน (Present History)
          </label>
          <textarea
            rows={2}
            value={presentHistory}
            onChange={(e) => setPresentHistory(e.target.value)}
            placeholder="ประวัติการเจ็บป่วยในปัจจุบัน อาการกำเริบเมื่อใด สิ่งที่ทำให้ทุเลาหรือรุนแรงขึ้น..."
            className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary"
          />
        </div>

        {/* ประวัติอดีต, ครอบครัว, ส่วนตัว (Past, Family, Personal History) */}
        <div className="space-y-4 pt-3 border-t border-clinic-line">
          {/* ประวัติอดีต (Past History) */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-clinic-ink">ประวัติอดีต (Past History)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* โรคประจำตัว */}
              <div className="p-3 bg-clinic-bg/30 border border-clinic-line rounded-control space-y-2">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="underlying"
                      checked={!hasUnderlyingDisease}
                      onChange={() => {
                        setHasUnderlyingDisease(false);
                        setUnderlyingDiseaseDetails("");
                      }}
                    />
                    <span>ปฏิเสธโรคประจำตัว</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="underlying"
                      checked={hasUnderlyingDisease}
                      onChange={() => setHasUnderlyingDisease(true)}
                    />
                    <span>มีโรคประจำตัว</span>
                  </label>
                </div>
                {hasUnderlyingDisease && (
                  <input
                    type="text"
                    placeholder="ระบุโรคประจำตัว..."
                    value={underlyingDiseaseDetails}
                    onChange={(e) => setUnderlyingDiseaseDetails(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-clinic-line rounded bg-white"
                  />
                )}
              </div>

              {/* การแพ้ยา */}
              <div className="p-3 bg-clinic-bg/30 border border-clinic-line rounded-control space-y-2">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="drugAllergy"
                      checked={!hasDrugAllergy}
                      onChange={() => {
                        setHasDrugAllergy(false);
                        setDrugAllergyDetails("");
                      }}
                    />
                    <span>ปฏิเสธการแพ้ยา</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="drugAllergy"
                      checked={hasDrugAllergy}
                      onChange={() => setHasDrugAllergy(true)}
                    />
                    <span className="text-rose-700 font-semibold">แพ้ยา</span>
                  </label>
                </div>
                {hasDrugAllergy && (
                  <input
                    type="text"
                    placeholder="ระบุยาที่แพ้และอาการ..."
                    value={drugAllergyDetails}
                    onChange={(e) => setDrugAllergyDetails(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-clinic-line rounded bg-white text-rose-700"
                  />
                )}
              </div>

              {/* การแพ้อาหาร */}
              <div className="p-3 bg-clinic-bg/30 border border-clinic-line rounded-control space-y-2">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="foodAllergy"
                      checked={!hasFoodAllergy}
                      onChange={() => {
                        setHasFoodAllergy(false);
                        setFoodAllergyDetails("");
                      }}
                    />
                    <span>ปฏิเสธการแพ้อาหาร</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="foodAllergy"
                      checked={hasFoodAllergy}
                      onChange={() => setHasFoodAllergy(true)}
                    />
                    <span className="text-amber-700 font-semibold">แพ้อาหาร</span>
                  </label>
                </div>
                {hasFoodAllergy && (
                  <input
                    type="text"
                    placeholder="ระบุอาหารที่แพ้..."
                    value={foodAllergyDetails}
                    onChange={(e) => setFoodAllergyDetails(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-clinic-line rounded bg-white text-amber-700"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ประวัติครอบครัว (Family History) */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-clinic-ink">ประวัติครอบครัว (Family History)</h4>
            <div className="p-3 bg-clinic-bg/30 border border-clinic-line rounded-control flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="familyDisease"
                  checked={!hasFamilyDisease}
                  onChange={() => {
                    setHasFamilyDisease(false);
                    setFamilyDiseaseDetails("");
                  }}
                />
                <span>ครอบครัวปฏิเสธโรคทางพันธุกรรม</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="familyDisease"
                  checked={hasFamilyDisease}
                  onChange={() => setHasFamilyDisease(true)}
                />
                <span>ครอบครัวมีโรคทางพันธุกรรม</span>
              </label>
              {hasFamilyDisease && (
                <input
                  type="text"
                  placeholder="ระบุโรคทางพันธุกรรมในครอบครัว..."
                  value={familyDiseaseDetails}
                  onChange={(e) => setFamilyDiseaseDetails(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-clinic-line rounded bg-white"
                />
              )}
            </div>
          </div>

          {/* ประวัติส่วนตัว (Personal History) */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-clinic-ink">ประวัติส่วนตัว (Personal History)</h4>
            <div className="p-3 bg-clinic-bg/30 border border-clinic-line rounded-control flex flex-wrap items-center gap-6 text-xs">
              {/* Alcohol */}
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="alcohol"
                    checked={!drinksAlcohol}
                    onChange={() => setDrinksAlcohol(false)}
                  />
                  <span>ปฏิเสธการดื่มแอลกอฮอล์</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="alcohol"
                    checked={drinksAlcohol}
                    onChange={() => setDrinksAlcohol(true)}
                  />
                  <span>ดื่มแอลกอฮอล์</span>
                </label>
              </div>

              {/* Smoking */}
              <div className="flex items-center gap-3 border-l border-clinic-line pl-6">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="smoking"
                    checked={!smokes}
                    onChange={() => setSmokes(false)}
                  />
                  <span>ปฏิเสธการสูบบุหรี่</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="smoking"
                    checked={smokes}
                    onChange={() => setSmokes(true)}
                  />
                  <span>สูบบุหรี่</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 3: ตรวจร่างกาย, สัญญาณชีพ, Pain Score, Reflexes & Menstruation (Part 3)
          ========================================================= */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>ส่วนที่ ๓: การตรวจร่างกายก่อนการรักษา (Physical Examination) & การวินิจฉัยแผนปัจจุบัน</span>
          </h2>
          <span className="text-xs text-clinic-ink-soft">Vitals, Pain Score & Reflexes</span>
        </div>

        {/* Vital Signs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              อุณหภูมิ Temp (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={(e) => setTemp(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs font-mono bg-clinic-bg/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              ชีพจร Pulse (Beats/min)
            </label>
            <input
              type="number"
              value={pulse}
              onChange={(e) => setPulse(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs font-mono bg-clinic-bg/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              การหายใจ RR (Breaths/min)
            </label>
            <input
              type="number"
              value={respirationRate}
              onChange={(e) =>
                setRespirationRate(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs font-mono bg-clinic-bg/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              ความดันโลหิต BP (mmHg)
            </label>
            <input
              type="text"
              value={bp}
              onChange={(e) => setBp(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs font-mono bg-clinic-bg/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              ส่วนสูง Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs font-mono bg-clinic-bg/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              น้ำหนัก Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs font-mono bg-clinic-bg/30"
            />
          </div>
        </div>

        {/* BMI Badge */}
        {bmiValue && bmiClassification && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-clinic-ink-soft">
              ค่าดัชนีมวลกาย BMI: <strong className="font-mono text-sm text-clinic-ink">{bmiValue}</strong>
            </span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${bmiClassification.color}`}
            >
              {bmiClassification.label}
            </span>
          </div>
        )}

        {/* Pain Score Assessment (ก่อนการรักษา) */}
        <div className="space-y-3 pt-3 border-t border-clinic-line">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-clinic-ink flex items-center gap-1.5">
              <span>🎯 ระดับความปวด (ก่อนการรักษา) Pain score (Before treatment)</span>
            </label>
            <span className="text-xs font-bold text-clinic-primary-deep font-mono">
              {painScoreBefore} / 10
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PAIN_SCORES.map((p) => {
              const isSelected = painScoreBefore === p.score;
              return (
                <button
                  key={p.score}
                  type="button"
                  onClick={() => setPainScoreBefore(p.score)}
                  className={`p-2.5 rounded-control border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${isSelected
                      ? "bg-clinic-primary text-white border-clinic-primary shadow-xs font-bold scale-[1.02]"
                      : "bg-clinic-bg/40 border-clinic-line hover:border-clinic-primary/50 text-clinic-ink"
                    }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="text-xs font-mono font-bold">{p.score}</span>
                  <span className="text-[10px] truncate max-w-full">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modern Medical Diagnosis & Additional Symptoms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-clinic-line">
          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">
              การวินิจฉัยทางการแพทย์แผนปัจจุบัน (ถ้ามี) Modern Medical diagnosis
            </label>
            <input
              type="text"
              value={modernDiagnosis}
              onChange={(e) => setModernDiagnosis(e.target.value)}
              placeholder="เช่น Myofascial Pain Syndrome, Cervical Strain..."
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">
              อาการเพิ่มเติม (Additional Symptoms)
            </label>
            <input
              type="text"
              value={additionalSymptoms}
              onChange={(e) => setAdditionalSymptoms(e.target.value)}
              placeholder="อาการตรวจพบเพิ่มเติม เช่น มีจุดกดเจ็บบริเวณสะบัก..."
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>
        </div>

        {/* Reflexes (RT / LT) */}
        <div className="space-y-2 pt-3 border-t border-clinic-line">
          <h4 className="font-bold text-xs text-clinic-ink">
            การตรวจระบบประสาทและรีเฟล็กซ์ (Deep Tendon Reflexes)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-clinic-bg/30 border border-clinic-line rounded space-y-1.5">
              <span className="font-semibold text-clinic-primary-deep block">Bicep Jerk</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">RT:</span>
                  <input
                    type="text"
                    value={bicepRT}
                    onChange={(e) => setBicepRT(e.target.value)}
                    className="w-full px-2 py-0.5 text-xs border rounded text-center bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">LT:</span>
                  <input
                    type="text"
                    value={bicepLT}
                    onChange={(e) => setBicepLT(e.target.value)}
                    className="w-full px-2 py-0.5 text-xs border rounded text-center bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-clinic-bg/30 border border-clinic-line rounded space-y-1.5">
              <span className="font-semibold text-clinic-primary-deep block">Triceps Jerk</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">RT:</span>
                  <input
                    type="text"
                    value={tricepsRT}
                    onChange={(e) => setTricepsRT(e.target.value)}
                    className="w-full px-2 py-0.5 text-xs border rounded text-center bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">LT:</span>
                  <input
                    type="text"
                    value={tricepsLT}
                    onChange={(e) => setTricepsLT(e.target.value)}
                    className="w-full px-2 py-0.5 text-xs border rounded text-center bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-clinic-bg/30 border border-clinic-line rounded space-y-1.5">
              <span className="font-semibold text-clinic-primary-deep block">Knee Jerk</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">RT:</span>
                  <input
                    type="text"
                    value={kneeRT}
                    onChange={(e) => setKneeRT(e.target.value)}
                    className="w-full px-2 py-0.5 text-xs border rounded text-center bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">LT:</span>
                  <input
                    type="text"
                    value={kneeLT}
                    onChange={(e) => setKneeLT(e.target.value)}
                    className="w-full px-2 py-0.5 text-xs border rounded text-center bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-clinic-bg/30 border border-clinic-line rounded space-y-1.5">
              <span className="font-semibold text-clinic-primary-deep block">Ankle Jerk</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">RT:</span>
                  <input
                    type="text"
                    value={ankleRT}
                    onChange={(e) => setAnkleRT(e.target.value)}
                    className="w-full px-2 py-0.5 text-xs border rounded text-center bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">LT:</span>
                  <input
                    type="text"
                    value={ankleLT}
                    onChange={(e) => setAnkleLT(e.target.value)}
                    className="w-full px-2 py-0.5 text-xs border rounded text-center bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ประวัติประจำเดือน (Menstruation History) */}
        <div className="pt-2 border-t border-clinic-line">
          <label className="block text-xs font-semibold text-clinic-ink mb-1">
            ประวัติประจำเดือน (Menstruation History)
          </label>
          <input
            type="text"
            value={menstruationHistory}
            onChange={(e) => setMenstruationHistory(e.target.value)}
            placeholder="เช่น รอบเดือนมาสม่ำเสมอ ทุก 28 วัน ไม่ปวดประจำเดือน / ประจำเดือนหมดแล้ว..."
            className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
          />
        </div>
      </div>

      {/* =========================================================
          SECTION 4: การวินิจฉัยทางการแพทย์แผนไทย (Part 4 TTM Diagnosis)
          ========================================================= */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>ส่วนที่ ๔: การวินิจฉัยทางการแพทย์แผนไทย (Thai Traditional Medical Diagnosis)</span>
          </h2>
          <span className="text-xs text-clinic-ink-soft">สมุฏฐาน 5 ด้าน & มูลเหตุเกิดโรค</span>
        </div>

        {/* ผลการวิเคราะห์สมุฏฐาน (Principles for diagnosis) */}
        <div className="bg-clinic-bg/40 p-4 rounded-control border border-clinic-line space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-clinic-primary-deep">
              ผลการวิเคราะห์สมุฏฐาน (Principles for diagnosis)
            </h3>
            {hasExistingDhatuPrinciple && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ มีข้อมูลธาตุสมุฏฐานประจำตัวแล้ว (ไม่ต้องเลือกซ้ำ)
              </span>
            )}
          </div>

          {hasExistingDhatuPrinciple && formMode === "CONTINUED_VISIT" ? (
            <div className="bg-white p-4 rounded border border-clinic-line space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● ธาตุสมุฏฐาน (Elementary):</span>
                  <div className="text-[11px] text-clinic-ink space-y-0.5">
                    <div>กำเนิด/ตอนเกิด: <strong>{DHATU_OPTIONS.find((o) => o.value === conceptionDhatu)?.label || conceptionDhatu}</strong></div>
                    <div>ปฏิสนธิลักษณะ: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === conceptionCharacteristic)?.label || conceptionCharacteristic}</strong></div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● อุตุสมุฏฐาน (Seasonal):</span>
                  <div className="text-[11px] text-clinic-ink space-y-0.5">
                    <div>เมื่อเริ่มเจ็บป่วย: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === seasonalOnset)?.label || seasonalOnset}</strong></div>
                    <div>เมื่อมาพบแพทย์: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === seasonalCurrent)?.label || seasonalCurrent}</strong></div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● อายุสมุฏฐาน (Age):</span>
                  <div className="text-[11px] text-clinic-ink">
                    ช่วงวัย: <strong>{AGE_OPTIONS.find((o) => o.value === agePrinciple)?.label || agePrinciple}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● กาลสมุฏฐาน (Time):</span>
                  <div className="text-[11px] text-clinic-ink space-y-0.5">
                    <div>เมื่ออาการกำเริบ: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === timeOnset)?.label || timeOnset}</strong></div>
                    <div>เมื่อมาพบแพทย์: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === timeCurrent)?.label || timeCurrent}</strong></div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● ประเทศสมุฏฐาน (Geographical):</span>
                  <div className="text-[11px] text-clinic-ink space-y-0.5">
                    <div>ภูมิลำเนาเกิด: <strong>{DHATU_OPTIONS.find((o) => o.value === geoBirthplace)?.label || geoBirthplace}</strong></div>
                    <div>ที่อยู่ปัจจุบัน: <strong>{DHATU_OPTIONS.find((o) => o.value === geoCurrent)?.label || geoCurrent}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 1. ธาตุสมุฏฐาน */}
              <div className="space-y-2">
                <span className="font-bold text-clinic-ink block">● ธาตุสมุฏฐาน (Elementary principles)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                  <div>
                    <span className="text-[11px] text-clinic-ink-soft block mb-1">ปฏิสนธิ/ตอนเกิด (Dhatu):</span>
                    <div className="flex flex-wrap gap-2">
                      {DHATU_OPTIONS.map((item) => (
                        <label key={item.value} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="conceptionDhatu"
                            value={item.value}
                            checked={conceptionDhatu === item.value}
                            onChange={() => setConceptionDhatu(item.value)}
                            className="accent-clinic-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-clinic-ink-soft block mb-1">ปฏิสนธิลักษณะ (TriDosha):</span>
                    <div className="flex flex-wrap gap-3">
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <label key={item.value} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="conceptionCharacteristic"
                            value={item.value}
                            checked={conceptionCharacteristic === item.value}
                            onChange={() => setConceptionCharacteristic(item.value)}
                            className="accent-clinic-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. อุตุสมุฏฐาน */}
              <div className="space-y-2 pt-2 border-t border-clinic-line/60">
                <span className="font-bold text-clinic-ink block">● อุตุสมุฏฐาน (Seasonal principles)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                  <div>
                    <span className="text-[11px] text-clinic-ink-soft block mb-1">เมื่อเริ่มเจ็บป่วย:</span>
                    <div className="flex flex-wrap gap-3">
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <label key={item.value} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="seasonalOnset"
                            value={item.value}
                            checked={seasonalOnset === item.value}
                            onChange={() => setSeasonalOnset(item.value)}
                            className="accent-clinic-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-clinic-ink-soft block mb-1">เมื่อมาพบแพทย์:</span>
                    <div className="flex flex-wrap gap-3">
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <label key={item.value} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="seasonalCurrent"
                            value={item.value}
                            checked={seasonalCurrent === item.value}
                            onChange={() => setSeasonalCurrent(item.value)}
                            className="accent-clinic-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. อายุสมุฏฐาน */}
              <div className="space-y-2 pt-2 border-t border-clinic-line/60">
                <span className="font-bold text-clinic-ink block">● อายุสมุฏฐาน (Age principles)</span>
                <div className="flex flex-wrap gap-4 pl-3">
                  {AGE_OPTIONS.map((item) => (
                    <label key={item.value} className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="agePrinciple"
                        value={item.value}
                        checked={agePrinciple === item.value}
                        onChange={() => setAgePrinciple(item.value)}
                        className="accent-clinic-primary"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. กาลสมุฏฐาน */}
              <div className="space-y-2 pt-2 border-t border-clinic-line/60">
                <span className="font-bold text-clinic-ink block">● กาลสมุฏฐาน (Time principles)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                  <div>
                    <span className="text-[11px] text-clinic-ink-soft block mb-1">เมื่ออาการกำเริบ:</span>
                    <div className="flex flex-wrap gap-3">
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <label key={item.value} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="timeOnset"
                            value={item.value}
                            checked={timeOnset === item.value}
                            onChange={() => setTimeOnset(item.value)}
                            className="accent-clinic-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-clinic-ink-soft block mb-1">เมื่อมาพบแพทย์:</span>
                    <div className="flex flex-wrap gap-3">
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <label key={item.value} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="timeCurrent"
                            value={item.value}
                            checked={timeCurrent === item.value}
                            onChange={() => setTimeCurrent(item.value)}
                            className="accent-clinic-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. ประเทศสมุฏฐาน */}
              <div className="space-y-2 pt-2 border-t border-clinic-line/60">
                <span className="font-bold text-clinic-ink block">● ประเทศสมุฏฐาน (Geographical principles)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                  <div>
                    <span className="text-[11px] text-clinic-ink-soft block mb-1">ภูมิลำเนา (Place of birth):</span>
                    <div className="flex flex-wrap gap-2">
                      {DHATU_OPTIONS.map((item) => (
                        <label key={item.value} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="geoBirthplace"
                            value={item.value}
                            checked={geoBirthplace === item.value}
                            onChange={() => setGeoBirthplace(item.value)}
                            className="accent-clinic-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-clinic-ink-soft block mb-1">ปัจจุบัน (Present address):</span>
                    <div className="flex flex-wrap gap-2">
                      {DHATU_OPTIONS.map((item) => (
                        <label key={item.value} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="geoCurrent"
                            value={item.value}
                            checked={geoCurrent === item.value}
                            onChange={() => setGeoCurrent(item.value)}
                            className="accent-clinic-primary"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* มูลเหตุการเกิดโรค (Cause of symptoms Checkboxes) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-clinic-ink">
            มูลเหตุการเกิดโรค (Cause of symptoms):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={causeFood}
                onChange={(e) => setCauseFood(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>อาหาร (Food)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={causePosition}
                onChange={(e) => setCausePosition(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>อิริยาบถ (Position)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={causeWeather}
                onChange={(e) => setCauseWeather(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>ความร้อน-ความเย็น</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={causeFastingSleep}
                onChange={(e) => setCauseFastingSleep(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>อดนอน อดข้าว อดน้ำ</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={causeIncontinence}
                onChange={(e) => setCauseIncontinence(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>กลั้นอุจจาระปัสสาวะ</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={causeWorkHard}
                onChange={(e) => setCauseWorkHard(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>ทำงานเกินกำลัง</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={causeSadness}
                onChange={(e) => setCauseSadness(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>ความเศร้าโศกเสียใจ</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={causeWrath}
                onChange={(e) => setCauseWrath(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>ความโกรธ (Wrath)</span>
            </label>
          </div>

          <div className="pt-1">
            <input
              type="text"
              placeholder="อื่นๆ (etc.) ระบุเพิ่มเติม..."
              value={causeOther}
              onChange={(e) => setCauseOther(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>
        </div>

        {/* สรุปความเจ็บป่วย & สมุฏฐานธาตุพิการ & การวินิจฉัยโรคแผนไทย */}
        <div className="space-y-4 pt-3 border-t border-clinic-line">
          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">
              สรุปความเจ็บป่วย (Summary of sickness)
            </label>
            <textarea
              rows={2}
              value={summaryOfSickness}
              onChange={(e) => setSummaryOfSickness(e.target.value)}
              placeholder="สรุปภาพรวมความเจ็บป่วยและสาเหตุ..."
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-clinic-ink mb-1">
                สมุฏฐานธาตุพิการ (Diagnosis based on the four elements)
              </label>
              <input
                type="text"
                value={diagnosisElements}
                onChange={(e) => setDiagnosisElements(e.target.value)}
                placeholder="เช่น ธาตุดินพิการ, ลมกองหยาบ..."
                className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-clinic-primary-deep mb-1">
                การวินิจฉัยโรค ทางแพทย์แผนไทย/รหัสโรค (TTM Diagnosis) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ttmDiagnosis}
                onChange={(e) => setTtmDiagnosis(e.target.value)}
                placeholder="เช่น โรคลมปลายปัตฆาตสัญญาณ 4-5, ลมจับโปงแห้งเข่า..."
                className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30 font-bold text-clinic-primary-deep"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 5: การรักษา, หัตถการ, คำแนะนำ & Pain Score หลังรักษา (Part 5)
          ========================================================= */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>ส่วนที่ ๕: การรักษาและคำแนะนำ (Treatment Program & Suggestions)</span>
          </h2>
          <span className="text-xs text-clinic-ink-soft">แผนการรักษา & การประเมินผล</span>
        </div>

        {/* แผนการรักษา (Treatment Plan) */}
        <div>
          <label className="block text-xs font-bold text-clinic-ink mb-1">
            ๑. แผนการรักษา (Treatment plan)
          </label>
          <input
            type="text"
            value={treatmentPlan}
            onChange={(e) => setTreatmentPlan(e.target.value)}
            placeholder="ระบุแผนการรักษา เช่น นวดแก้อาการและประคบสมุนไพรสด..."
            className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30 focus:ring-2 focus:ring-clinic-primary"
          />
        </div>

        {/* วิธีการ (Treatment program Checkboxes) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-clinic-ink">
            ๒. วิธีการรักษา / หัตถการ (Treatment program):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <label className="inline-flex items-center gap-2 p-2.5 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={programCompress}
                onChange={(e) => setProgramCompress(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>ประคบสมุนไพร (Herbal compress)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2.5 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={programSteam}
                onChange={(e) => setProgramSteam(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>อบสมุนไพร (Herbal steam)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2.5 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={programHerbalMed}
                onChange={(e) => setProgramHerbalMed(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>จ่ายยาสมุนไพร (Prescription)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2.5 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer">
              <input
                type="checkbox"
                checked={programMassage}
                onChange={(e) => setProgramMassage(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>หัตถการ (นวด/หัตถการเฉพาะจุด)</span>
            </label>
          </div>

          {programMassage && (
            <div className="pt-1">
              <input
                type="text"
                placeholder="ระบุรายละเอียดหัตถการ เช่น นวดกดจุดแก้อาการสัญญาณ 4-5 ศีรษะและบ่า..."
                value={programMassageDetails}
                onChange={(e) => setProgramMassageDetails(e.target.value)}
                className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-clinic-bg/30"
              />
            </div>
          )}
        </div>

        {/* ตรวจร่างกายและประเมินผลหลังการรักษา */}
        <div>
          <label className="block text-xs font-semibold text-clinic-ink mb-1">
            ตรวจร่างกายและประเมินผลหลังการรักษา (Physical examination and evaluation after treatments)
          </label>
          <textarea
            rows={2}
            value={evalAfterTreatment}
            onChange={(e) => setEvalAfterTreatment(e.target.value)}
            placeholder="เช่น กล้ามเนื้อคลายตัว ความตึงตัวลดลง ผู้ป่วยรู้สึกเบาสบาย..."
            className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
          />
        </div>

        {/* Pain Score Assessment (หลังการรักษา) */}
        <div className="space-y-3 pt-3 border-t border-clinic-line">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-clinic-ink flex items-center gap-1.5">
              <span>✨ ระดับความปวด (หลังการรักษา) Pain score (After treatment)</span>
            </label>
            <span className="text-xs font-bold text-emerald-700 font-mono">
              {painScoreAfter} / 10{" "}
              {painScoreBefore - painScoreAfter > 0 && (
                <span className="text-xs font-bold text-emerald-600 ml-1">
                  (ความปวดลดลง {painScoreBefore - painScoreAfter} ระดับ)
                </span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PAIN_SCORES.map((p) => {
              const isSelected = painScoreAfter === p.score;
              return (
                <button
                  key={p.score}
                  type="button"
                  onClick={() => setPainScoreAfter(p.score)}
                  className={`p-2.5 rounded-control border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold scale-[1.02]"
                      : "bg-clinic-bg/40 border-clinic-line hover:border-emerald-500/50 text-clinic-ink"
                    }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="text-xs font-mono font-bold">{p.score}</span>
                  <span className="text-[10px] truncate max-w-full">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* คำแนะนำ & นัดหมายติดตามผล */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-clinic-line">
          <div>
            <label className="block text-xs font-bold text-clinic-ink mb-1">
              ๓. คำแนะนำ (Suggestions)
            </label>
            <textarea
              rows={2}
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="คำแนะนำการปฏิบัติตัว ท่าบริหารยืดเหยียด..."
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-clinic-ink mb-1">
              ๔. นัดหมายเพื่อติดตามผลการรักษา (Follow up)
            </label>
            <textarea
              rows={2}
              value={followup}
              onChange={(e) => setFollowup(e.target.value)}
              placeholder="เช่น นัดติดตามผลในอีก 1 สัปดาห์ (หรือระบุวันที่)"
              className="w-full px-3 py-2 border border-clinic-line rounded-control text-xs bg-clinic-bg/30"
            />
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 6: ใบสั่งการรักษา & การเงิน (Part 6 Prescription & Billing)
          ========================================================= */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-clinic-line pb-3">
          <h2 className="font-display font-bold text-sm text-clinic-primary-deep flex items-center gap-2">
            <span>ส่วนที่ ๖: ใบสั่งการรักษา & การเงิน (Prescription & Billing)</span>
          </h2>
          <span className="text-xs font-semibold text-clinic-ink-soft">
            ยอดรวมทั้งสิ้น:{" "}
            <strong className="font-mono text-base text-clinic-primary-deep">
              ฿{grandTotal.toLocaleString()}
            </strong>
          </span>
        </div>

        {/* สิทธิการรักษา Checkboxes */}
        <div className="p-3.5 bg-clinic-bg/40 border border-clinic-line rounded-control space-y-2">
          <label className="block text-xs font-bold text-clinic-ink">
            สิทธิการรักษา (Medical Rights):
          </label>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold">
              <input
                type="radio"
                name="medicalRights"
                checked={medicalRights === "PAY"}
                onChange={() => setMedicalRights("PAY")}
              />
              <span>ชำระเงิน</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="medicalRights"
                checked={medicalRights === "FREE_ELDER"}
                onChange={() => setMedicalRights("FREE_ELDER")}
              />
              <span>ไม่ต้องชำระเงิน (ผู้สูงอายุ, นักบวช, ผู้พิการ)</span>
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="medicalRights"
                checked={medicalRights === "FREE_OTHER"}
                onChange={() => setMedicalRights("FREE_OTHER")}
              />
              <span>อื่นๆ (ระบุ)</span>
            </label>

            {medicalRights === "FREE_OTHER" && (
              <input
                type="text"
                placeholder="ระบุสิทธิยกเว้นชำระเงิน..."
                value={medicalRightsOther}
                onChange={(e) => setMedicalRightsOther(e.target.value)}
                className="px-2 py-1 text-xs border rounded bg-white"
              />
            )}
          </div>
        </div>

        {/* Selector for Adding Medicine from Inventory */}
        <div className="bg-clinic-bg/60 border border-clinic-line rounded-control p-4 space-y-3">
          <div className="font-bold text-xs text-clinic-primary-deep flex items-center gap-1.5">
            <span>+ สั่งจ่ายยาสมุนไพรจากคลังยา</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
                เลือกยาสมุนไพร / เวชภัณฑ์
              </label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-white focus:ring-2 focus:ring-clinic-primary"
              >
                {medicines.map((m) => (
                  <option key={m.medicineId} value={m.medicineId}>
                    {m.medicineName} (฿{m.unitPrice} / {m.unitType ?? "หน่วย"}) · สต็อก {m.stockRemaining ?? 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
                จำนวน
              </label>
              <input
                type="number"
                min={1}
                value={medQuantity}
                onChange={(e) => setMedQuantity(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-white font-mono text-center"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
                วิธีใช้ / ขนาดที่ใช้
              </label>
              <input
                type="text"
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                placeholder="วิธีรับประทาน..."
                className="w-full px-2.5 py-1.5 border border-clinic-line rounded text-xs bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddMedicine}
                className="w-full px-3 py-1.5 bg-clinic-primary hover:bg-clinic-primary-deep text-white font-bold text-xs rounded-control transition-all shadow-2xs cursor-pointer"
              >
                + เพิ่มยา
              </button>
            </div>
          </div>
        </div>

        {/* Prescribed Items Table */}
        {prescribedMedicines.length > 0 ? (
          <div className="overflow-x-auto border border-clinic-line rounded-control">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-clinic-bg text-clinic-ink-soft uppercase text-[10px] tracking-wider border-b border-clinic-line">
                <tr>
                  <th className="px-4 py-2.5">รายการยาสมุนไพร</th>
                  <th className="px-4 py-2.5">วิธีใช้</th>
                  <th className="px-4 py-2.5 text-right">ราคา/หน่วย</th>
                  <th className="px-4 py-2.5 text-center">จำนวน</th>
                  <th className="px-4 py-2.5 text-right">รวม (บาท)</th>
                  <th className="px-4 py-2.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-line bg-white">
                {prescribedMedicines.map((item) => (
                  <tr key={item.medicineId} className="hover:bg-clinic-bg/30">
                    <td className="px-4 py-2.5 font-semibold text-clinic-ink">
                      {item.medicineName}
                    </td>
                    <td className="px-4 py-2.5 text-clinic-ink-soft text-[11px]">
                      {item.dosageInstructions || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">฿{item.unitPrice}</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold">
                      {item.quantity} {item.unitType}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-clinic-primary-deep">
                      ฿{item.subTotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(item.medicineId)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-clinic-ink-soft text-center py-3 bg-clinic-bg/30 rounded-control border border-dashed border-clinic-line">
            ยังไม่มีรายการยาสมุนไพรที่สั่งจ่ายในครั้งนี้
          </p>
        )}

        {/* Procedure Fee & Payment details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-clinic-line">
          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              ค่าบริการตรวจ/หัตถการ (บาท)
            </label>
            <input
              type="number"
              value={procedureFee}
              onChange={(e) => setProcedureFee(Number(e.target.value))}
              placeholder="300"
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              วิธีการชำระเงิน
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
            >
              <option value="CASH">💵 เงินสด (CASH)</option>
              <option value="TRANSFER">🏦 โอนเงินผ่านธนาคาร (TRANSFER)</option>
              <option value="QR_CODE">📱 สแกน QR Code (PromptPay)</option>
              <option value="CREDIT_CARD">💳 บัตรเครดิต (CREDIT_CARD)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              สถานะการชำระเงิน
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30 font-semibold"
            >
              <option value="PAID">✅ ชำระเงินเรียบร้อยแล้ว (PAID)</option>
              <option value="PENDING">⏳ รอดำเนินการชำระเงิน (PENDING)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Submit Bar */}
      <div className="bg-white border border-clinic-line rounded-card p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="text-xs text-clinic-ink-soft">
          <p className="font-semibold text-clinic-ink">
            ยอดรวมค่ารักษาและยาสมุนไพร:{" "}
            <span className="font-mono text-lg font-bold text-clinic-primary-deep ml-1">
              ฿{grandTotal.toLocaleString()}
            </span>{" "}
            บาท
            {medicalRights !== "PAY" && (
              <span className="text-emerald-700 font-bold ml-2">(ยกเว้นค่ารักษาพยาบาล)</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/doctor/treatments"
            className="w-full sm:w-auto text-center px-4 py-2.5 rounded-control text-xs font-semibold text-clinic-ink bg-clinic-bg border border-clinic-line hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-control text-sm font-bold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>
              {isPending
                ? "กำลังบันทึกเวชระเบียน…"
                : "✓ บันทึกเวชระเบียนและออกใบสั่งการรักษา"}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
