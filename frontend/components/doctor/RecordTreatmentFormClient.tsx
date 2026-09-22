"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
import { scrollToFirstError } from "@/lib/form-utils";
import { useUnsavedChanges } from "@/lib/use-unsaved-changes";
import { formatDoctorDisplayName } from "@/lib/utils";
import { Loader2, AlertCircle, Calendar, Clock, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MedicineCombobox } from "@/components/doctor/MedicineCombobox";
import type {
  AppointmentResponseDTO,
  AppointmentSlotResponseDTO,
  WorkingScheduleResponseDTO,
  PatientResponseDTO,
  MedicineResponseDTO,
  RecordTreatmentRequestDTO,
  RecordTreatmentResponseDTO,
  ReceiptRequestDTO,
  ReceiptItemDTO,
  Dhatu,
  TriDosha,
  AgePrinciple,
  SymptomCause,
  TreatmentProgramType,
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

function matchesDate(dateInput: string | Date | undefined, targetDate: string): boolean {
  if (!dateInput || !targetDate) return false;
  if (typeof dateInput === "string") {
    if (dateInput === targetDate || dateInput.startsWith(targetDate)) {
      return true;
    }
    if (dateInput.split("T")[0] === targetDate) {
      return true;
    }
  }

  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      const ly = d.getFullYear();
      const lm = String(d.getMonth() + 1).padStart(2, "0");
      const ld = String(d.getDate()).padStart(2, "0");
      if (`${ly}-${lm}-${ld}` === targetDate) {
        return true;
      }
      const uy = d.getUTCFullYear();
      const um = String(d.getUTCMonth() + 1).padStart(2, "0");
      const ud = String(d.getUTCDate()).padStart(2, "0");
      if (`${uy}-${um}-${ud}` === targetDate) {
        return true;
      }
    }
  } catch {}

  return false;
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Unsaved changes guard
  useUnsavedChanges(isDirty && !isSubmitting);

  const clearError = (field: string) => {
    setIsDirty(true);
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const renderError = (field: string) => {
    if (!errors[field]) return null;
    return (
      <p className="text-[11px] text-clinic-danger mt-1 flex items-center gap-1 font-medium">
        <AlertCircle className="w-3 h-3 shrink-0" />
        <span>{errors[field]}</span>
      </p>
    );
  };

  const handleTextBlur = (field: string, val: string) => {
    setIsDirty(true);
    if (!val || !val.trim()) {
      setErrors((prev) => ({
        ...prev,
        [field]: "กรุณากรอกข้อมูล หรือใส่ '-' หากไม่มีข้อมูล",
      }));
    } else {
      clearError(field);
    }
  };

  const handleVitalBlur = (field: string, val: number | string) => {
    setIsDirty(true);
    if (val === "" || val === undefined || val === null) {
      setErrors((prev) => ({
        ...prev,
        [field]: "กรุณาระบุตัวเลข หรือใส่ '0' หากไม่ได้วัด",
      }));
    } else {
      clearError(field);
    }
  };

  const handleBlur = (field: string, value?: any) => {
    if (!value || (typeof value === "string" && !value.trim()) || (typeof value === "number" && value <= 0)) {
      setErrors((prev) => ({
        ...prev,
        [field]: field === "patientId" || field === "selectedPatientId" ? "กรุณาเลือกผู้ป่วย" : "กรุณากรอกข้อมูลนี้",
      }));
    }
  };

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

  // Walk-in Working Schedule & Slot management
  const [walkInSlots, setWalkInSlots] = useState<AppointmentSlotResponseDTO[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | "">("");
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [noScheduleForDate, setNoScheduleForDate] = useState<boolean>(false);
  const [showNoScheduleDialog, setShowNoScheduleDialog] = useState<boolean>(false);

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
  const [personalHistory, setPersonalHistory] = useState("");

  // PART 3: Physical Examination & Pain Assessment
  const [temp, setTemp] = useState<number | "">("");
  const [pulse, setPulse] = useState<number | "">("");
  const [respirationRate, setRespirationRate] = useState<number | "">("");
  const [bp, setBp] = useState("");
  const [height, setHeight] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [painScoreBefore, setPainScoreBefore] = useState<number | null>(null);
  const [painScoreAfter, setPainScoreAfter] = useState<number | null>(null);

  // Modern Medical Diagnosis & Additional Symptoms
  const [modernDiagnosis, setModernDiagnosis] = useState("");
  const [additionalSymptoms, setAdditionalSymptoms] = useState("");

  // Reflexes (Bicep, Triceps, Knee, Ankle RT/LT)
  const [bicepRT, setBicepRT] = useState("");
  const [bicepLT, setBicepLT] = useState("");
  const [tricepsRT, setTricepsRT] = useState("");
  const [tricepsLT, setTricepsLT] = useState("");
  const [kneeRT, setKneeRT] = useState("");
  const [kneeLT, setKneeLT] = useState("");
  const [ankleRT, setAnkleRT] = useState("");
  const [ankleLT, setAnkleLT] = useState("");

  // Menstruation History
  const [menstruationHistory, setMenstruationHistory] = useState("");

  // PART 2 & PART 4: DhatuPrinciple (ธาตุสมุฏฐาน 5 ด้าน & ธาตุเจ้าเรือน)
  const [principalDhatu, setPrincipalDhatu] = useState<Dhatu | "">("");
  const [secondaryDhatu, setSecondaryDhatu] = useState<Dhatu | "">("");
  const [conceptionDhatu, setConceptionDhatu] = useState<Dhatu | "">("");
  const [conceptionCharacteristic, setConceptionCharacteristic] = useState<TriDosha | "">("");
  const [seasonalOnset, setSeasonalOnset] = useState<TriDosha | "">("");
  const [seasonalCurrent, setSeasonalCurrent] = useState<TriDosha | "">("");
  const [agePrinciple, setAgePrinciple] = useState<AgePrinciple | "">("");
  const [timeOnset, setTimeOnset] = useState<TriDosha | "">("");
  const [timeCurrent, setTimeCurrent] = useState<TriDosha | "">("");
  const [geoBirthplace, setGeoBirthplace] = useState<Dhatu | "">("");
  const [geoCurrent, setGeoCurrent] = useState<Dhatu | "">("");

  // มูลเหตุการเกิดโรค (Cause of symptoms Checkboxes)
  const [causeFood, setCauseFood] = useState(false);
  const [causePosition, setCausePosition] = useState(false);
  const [causeWeather, setCauseWeather] = useState(false);
  const [causeFastingSleep, setCauseFastingSleep] = useState(false);
  const [causeIncontinence, setCauseIncontinence] = useState(false);
  const [causeWorkHard, setCauseWorkHard] = useState(false);
  const [causeSadness, setCauseSadness] = useState(false);
  const [causeWrath, setCauseWrath] = useState(false);
  const [causeOther, setCauseOther] = useState("");

  // Summary of Sickness & TTM Diagnosis
  const [summaryOfSickness, setSummaryOfSickness] = useState("");
  const [diagnosisElements, setDiagnosisElements] = useState("");
  const [ttmDiagnosis, setTtmDiagnosis] = useState("");

  // PART 5: Treatment Plan & Program
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [programCompress, setProgramCompress] = useState(false);
  const [programSteam, setProgramSteam] = useState(false);
  const [programHerbalMed, setProgramHerbalMed] = useState(false);
  const [programMassage, setProgramMassage] = useState(false);
  const [programMassageDetails, setProgramMassageDetails] = useState("");
  const [programConsult, setProgramConsult] = useState(false);

  const [evalAfterTreatment, setEvalAfterTreatment] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [followup, setFollowup] = useState("");

  // PART 6: Billing & Prescriptions
  const [medicalRights, setMedicalRights] = useState<"PAY" | "FREE_ELDER" | "FREE_OTHER">("PAY");
  const [medicalRightsOther, setMedicalRightsOther] = useState("");
  const [additionalItems, setAdditionalItems] = useState<{ id: string; itemName: string; amount: number }[]>([]);
  const [billingNote, setBillingNote] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PENDING">("PAID");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<number>(
    medicines.length > 0 ? medicines[0].medicineId : 0
  );
  const [medQuantity, setMedQuantity] = useState<number>(1);
  const [medDosage, setMedDosage] = useState("");

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
      setSelectedSlotId("");
      clearError("slotId");
    }
  };

  // Fetch doctor's working schedules and slots for Walk-in on visitDate
  useEffect(() => {
    if (selectedAppointmentId !== "WALK_IN") {
      setNoScheduleForDate(false);
      setShowNoScheduleDialog(false);
      return;
    }

    if (!doctorId || !visitDate) return;

    let isMounted = true;
    setIsLoadingSlots(true);

    fetch(`/api/working-schedules/doctor/${doctorId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(async (schedules: WorkingScheduleResponseDTO[]) => {
        if (!isMounted) return;

        // Match schedule for visitDate (format YYYY-MM-DD)
        const matchedSchedules = (schedules || []).filter((s) => matchesDate(s.date, visitDate));

        if (matchedSchedules.length === 0) {
          setNoScheduleForDate(true);
          setShowNoScheduleDialog(true);
          setWalkInSlots([]);
          setSelectedSlotId("");
          setIsLoadingSlots(false);
          return;
        }

        setNoScheduleForDate(false);
        setShowNoScheduleDialog(false);

        // Fetch slots for matched schedules
        try {
          const slotPromises = matchedSchedules.map((ms) =>
            fetch(`/api/appointment-slots/schedule/${ms.scheduleId}`).then((r) =>
              r.ok ? r.json() : []
            )
          );
          const allSlotsNested: AppointmentSlotResponseDTO[][] = await Promise.all(slotPromises);
          const allSlots = allSlotsNested.flat();

          // Sort slots by startTime
          allSlots.sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );

          if (!isMounted) return;
          setWalkInSlots(allSlots);

          // Smart auto-selection: find slot matching current time if today, or first available slot
          const todayStr = new Date().toISOString().split("T")[0];
          const availableSlots = allSlots.filter((s) => s.status !== "BLOCKED");

          if (visitDate === todayStr) {
            const now = new Date();
            const currentSlot = availableSlots.find((s) => {
              const st = new Date(s.startTime);
              const et = new Date(s.endTime);
              return now >= st && now <= et;
            });
            if (currentSlot) {
              setSelectedSlotId(currentSlot.slotId);
              return;
            }
          }

          if (availableSlots.length > 0) {
            setSelectedSlotId((prev) => (prev ? prev : availableSlots[0].slotId));
          } else {
            setSelectedSlotId("");
          }
        } catch {
          if (isMounted) {
            setWalkInSlots([]);
            setSelectedSlotId("");
          }
        } finally {
          if (isMounted) setIsLoadingSlots(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNoScheduleForDate(true);
          setWalkInSlots([]);
          setSelectedSlotId("");
          setIsLoadingSlots(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedAppointmentId, doctorId, visitDate]);

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

    const available = med.stockRemaining ?? 0;
    if (available <= 0) {
      alert(`ไม่สามารถสั่งจ่ายยา '${med.medicineName}' ได้ เนื่องจากสต็อกคงเหลือเป็น 0`);
      return;
    }

    const existingItem = prescribedMedicines.find((p) => p.medicineId === med.medicineId);
    const currentInCart = existingItem?.quantity || 0;
    if (currentInCart + qty > available) {
      alert(`สต็อกยาไม่เพียงพอ! ยา '${med.medicineName}' มีคงเหลือ ${available} ${med.unitType ?? "หน่วย"} (ในรายการสั่งจ่ายมีอยู่แล้ว ${currentInCart} ${med.unitType ?? "หน่วย"})`);
      return;
    }

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

  // Custom Fee Items Handlers
  const handleAddCustomItem = (itemName = "", amount = 0) => {
    setAdditionalItems((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random().toString(36).substring(2, 5), itemName, amount },
    ]);
  };

  const handleRemoveCustomItem = (id: string) => {
    setAdditionalItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCustomItemChange = (id: string, field: "itemName" | "amount", value: string | number) => {
    setAdditionalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Grand Total Calculation
  const medicinesTotal = useMemo(() => {
    return prescribedMedicines.reduce((sum, item) => sum + item.subTotal, 0);
  }, [prescribedMedicines]);

  const additionalItemsTotal = useMemo(() => {
    return additionalItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [additionalItems]);

  const grandTotal = useMemo(() => {
    if (medicalRights !== "PAY") return 0;
    return medicinesTotal + additionalItemsTotal;
  }, [medicinesTotal, additionalItemsTotal, medicalRights]);

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
    const formatDhatu = (d?: Dhatu | null | "") => (d ? DHATU_OPTIONS.find((o) => o.value === d)?.label || d : "-");
    const formatDosha = (t?: TriDosha | null | "") => (t ? TRIDOSHA_OPTIONS.find((o) => o.value === t)?.label || t : "-");
    const formatAge = (a?: AgePrinciple | null | "") => (a ? AGE_OPTIONS.find((o) => o.value === a)?.label || a : "-");

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

    const newErrors: Record<string, string> = {};
    if (!selectedPatientId) {
      newErrors.patientId = "กรุณาเลือกผู้ป่วยที่เข้ารับการตรวจรักษา";
    }

    if (!symptoms.trim()) {
      newErrors.symptoms = "กรุณาระบุอาการสำคัญ (Symptoms/Condition)";
    } else if (symptoms.trim() === "-") {
      newErrors.symptoms = "กรุณาระบุอาการสำคัญ ไม่สามารถใส่เพียง '-' ได้";
    }

    if (selectedAppointmentId === "WALK_IN") {
      if (noScheduleForDate) {
        newErrors.slotId = "แพทย์ยังไม่มีตารางเวลาปฏิบัติงานในวันที่เลือก กรุณากำหนดตารางเวลาปฏิบัติงานก่อนบันทึกการรักษา";
        toast.error("แพทย์ยังไม่มีตารางเวลาปฏิบัติงานในวันที่เลือก กรุณากำหนดตารางเวลาปฏิบัติงานก่อนบันทึกการรักษา");
        setShowNoScheduleDialog(true);
        setErrors(newErrors);
        return;
      }
      if (!selectedSlotId) {
        newErrors.slotId = "กรุณาเลือกช่วงเวลาตรวจ (Appointment Slot) สำหรับผู้ป่วย Walk-in";
      }
    }

    // Causes of symptoms: at least 1 must be selected
    const hasAnyCause =
      causeFood ||
      causePosition ||
      causeWeather ||
      causeFastingSleep ||
      causeIncontinence ||
      causeWorkHard ||
      causeSadness ||
      causeWrath ||
      Boolean(causeOther.trim());
    if (!hasAnyCause) {
      newErrors.causesOfSymptoms = "กรุณาเลือกมูลเหตุการเกิดโรคอย่างน้อย 1 อย่าง";
    }

    // Clinical text fields: require actual text or '-'
    const checkTextOrDash = (field: string, val: string) => {
      if (!val || !val.trim()) {
        newErrors[field] = "กรุณากรอกข้อมูล หรือใส่ '-' หากไม่มีข้อมูล";
      }
    };

    checkTextOrDash("presentHistory", presentHistory);
    checkTextOrDash("menstruationHistory", menstruationHistory);
    checkTextOrDash("modernDiagnosis", modernDiagnosis);
    checkTextOrDash("additionalSymptoms", additionalSymptoms);
    checkTextOrDash("summaryOfSickness", summaryOfSickness);
    checkTextOrDash("diagnosisElements", diagnosisElements);
    checkTextOrDash("ttmDiagnosis", ttmDiagnosis);
    checkTextOrDash("treatmentPlan", treatmentPlan);
    checkTextOrDash("evalAfterTreatment", evalAfterTreatment);
    checkTextOrDash("suggestions", suggestions);
    checkTextOrDash("followup", followup);
    checkTextOrDash("bp", bp);

    // Reflexes
    checkTextOrDash("bicepRT", bicepRT);
    checkTextOrDash("bicepLT", bicepLT);
    checkTextOrDash("tricepsRT", tricepsRT);
    checkTextOrDash("tricepsLT", tricepsLT);
    checkTextOrDash("kneeRT", kneeRT);
    checkTextOrDash("kneeLT", kneeLT);
    checkTextOrDash("ankleRT", ankleRT);
    checkTextOrDash("ankleLT", ankleLT);

    // Conditional details
    if (programMassage && (!programMassageDetails || !programMassageDetails.trim())) {
      newErrors.programMassageDetails = "กรุณากรอกข้อมูล หรือใส่ '-' หากไม่มีข้อมูล";
    }
    if (hasUnderlyingDisease && !underlyingDiseaseDetails.trim()) {
      newErrors.underlyingDiseaseDetails = "กรุณาระบุรายละเอียด หรือใส่ '-'";
    }
    if (hasDrugAllergy && !drugAllergyDetails.trim()) {
      newErrors.drugAllergyDetails = "กรุณาระบุรายละเอียด หรือใส่ '-'";
    }
    if (hasFoodAllergy && !foodAllergyDetails.trim()) {
      newErrors.foodAllergyDetails = "กรุณาระบุรายละเอียด หรือใส่ '-'";
    }
    if (hasFamilyDisease && !familyDiseaseDetails.trim()) {
      newErrors.familyDiseaseDetails = "กรุณาระบุรายละเอียด หรือใส่ '-'";
    }

    // Numeric vitals: must be entered (number or 0)
    const checkVitalNumber = (field: string, val: number | string) => {
      if (val === "" || val === undefined || val === null) {
        newErrors[field] = "กรุณาระบุตัวเลข หรือใส่ '0' หากไม่ได้วัด";
      }
    };
    checkVitalNumber("temp", temp);
    checkVitalNumber("pulse", pulse);
    checkVitalNumber("respirationRate", respirationRate);
    checkVitalNumber("height", height);
    checkVitalNumber("weight", weight);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน หรือใส่ '-' ในช่องที่ไม่มีข้อมูล");
      setTimeout(() => scrollToFirstError(), 60);
      return;
    }

    setIsSubmitting(true);

    try {
      const recordDateObj = visitDate ? new Date(`${visitDate}T${visitTime || "00:00"}:00`) : new Date();
      const validRecordDateIso = isNaN(recordDateObj.getTime()) ? new Date().toISOString() : recordDateObj.toISOString();

      const selectedPrograms: TreatmentProgramType[] = [];
      if (programMassage) selectedPrograms.push("MASSAGE");
      if (programCompress) selectedPrograms.push("HERBAL_COMPRESS");
      if (programSteam) selectedPrograms.push("HERBAL_STEAM");
      if (programHerbalMed) selectedPrograms.push("HERBAL_MEDICINE");
      if (programConsult) selectedPrograms.push("CONSULTATION");

      const treatmentDTO: RecordTreatmentRequestDTO = {
        appointmentId: selectedAppointmentId === "WALK_IN" ? undefined : selectedAppointmentId,
        slotId: selectedAppointmentId === "WALK_IN" ? Number(selectedSlotId) : undefined,
        patientId: selectedPatientId,
        doctorId: Number(doctorId) || 1,
        recordDate: validRecordDateIso,
        symptoms: symptoms.trim(),
        presentHistory: presentHistory.trim(),
        personalHistory: personalHistory.trim() || "-",
        temp: temp !== "" ? Number(temp) : undefined,
        pulse: pulse !== "" ? Number(pulse) : undefined,
        respirationRate: respirationRate !== "" ? Number(respirationRate) : undefined,
        bp: bp.trim(),
        height: height !== "" ? Number(height) : undefined,
        weight: weight !== "" ? Number(weight) : undefined,
        bmi: bmiValue ? Number(bmiValue) : undefined,
        bicepRt: bicepRT.trim(),
        bicepLt: bicepLT.trim(),
        tricepsRt: tricepsRT.trim(),
        tricepsLt: tricepsLT.trim(),
        kneeRt: kneeRT.trim(),
        kneeLt: kneeLT.trim(),
        ankleRt: ankleRT.trim(),
        ankleLt: ankleLT.trim(),
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
        summaryOfSickness: summaryOfSickness.trim(),
        diagnosisElements: diagnosisElements.trim(),
        ttmDiagnosis: ttmDiagnosis.trim(),
        modernDiagnosis: modernDiagnosis.trim(),
        additionalSymptoms: additionalSymptoms.trim(),
        treatmentPlan: treatmentPlan.trim(),
        treatmentPrograms: selectedPrograms,
        treatmentProgramMassageDetails: programMassage ? (programMassageDetails.trim() || "-") : undefined,
        treatmentProgram: composedTreatmentProgram || undefined,
        evalAfterTreatment: evalAfterTreatment.trim(),
        suggestions: suggestions.trim(),
        followup: followup.trim(),
        painScoreBefore: painScoreBefore !== null ? painScoreBefore : undefined,
        painScoreAfter: painScoreAfter !== null ? painScoreAfter : undefined,
        principle: (!hasExistingDhatuPrinciple && (principalDhatu || secondaryDhatu || conceptionDhatu || seasonalOnset || agePrinciple)) ? {
          principalDhatu: principalDhatu || undefined,
          secondaryDhatu: secondaryDhatu || undefined,
          conceptionDhatu: conceptionDhatu || undefined,
          conceptionCharacteristic: conceptionCharacteristic || undefined,
          seasonalOnset: seasonalOnset || undefined,
          seasonalCurrent: seasonalCurrent || undefined,
          agePrinciple: agePrinciple || undefined,
          timeOnset: timeOnset || undefined,
          timeCurrent: timeCurrent || undefined,
          geoBirthplace: geoBirthplace || undefined,
          geoCurrent: geoCurrent || undefined,
        } : undefined,
        healthProfile: {
          presentHistory: presentHistory.trim(),
          underlyingDisease: hasUnderlyingDisease ? underlyingDiseaseDetails.trim() : "ปฏิเสธโรคประจำตัว",
          drugAllergy: hasDrugAllergy ? drugAllergyDetails.trim() : "ปฏิเสธการแพ้ยา",
          foodAllergy: hasFoodAllergy ? foodAllergyDetails.trim() : "ปฏิเสธการแพ้อาหาร",
          hereditaryDisease: hasFamilyDisease ? familyDiseaseDetails.trim() : "ครอบครัวปฏิเสธโรคทางพันธุกรรม",
          alcoholConsumption: drinksAlcohol ? "ดื่มแอลกอฮอล์" : "ปฏิเสธการดื่มแอลกอฮอล์",
          smokingHistory: smokes ? "สูบบุหรี่" : "ปฏิเสธการสูบบุหรี่",
          menstruation: menstruationHistory.trim() || "-",
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
      if (grandTotal > 0 || medicalRights !== "PAY" || additionalItems.length > 0 || prescribedMedicines.length > 0) {
        const receiptPayload: ReceiptRequestDTO = {
          recordTreatmentId: recordTreatmentId,
          receiptDate: visitDate ? `${visitDate}T${visitTime || "00:00"}:00` : new Date().toISOString(),
          paymentStatus: medicalRights !== "PAY" ? "PAID" : paymentStatus,
          paymentMethod: paymentMethod,
          additionalItems: additionalItems
            .filter((item) => item.itemName.trim() !== "")
            .map((item) => ({
              itemName: item.itemName.trim(),
              amount: Number(item.amount) || 0,
            })),
          note: billingNote.trim() || undefined,
        };

        await fetch("/api/receipts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(receiptPayload),
        }).catch((err) => console.error("Receipt error:", err));
      }

      toast.success("บันทึกเวชระเบียนการตรวจรักษาและใบสั่งการรักษาเรียบร้อยแล้ว!");
      setIsDirty(false);
      startTransition(() => {
        router.push(`/doctor/treatments/${recordTreatmentId}`);
        router.refresh();
      });
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setIsSubmitting(false);
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
            พิมพ์วิมานคลินิกการแพทย์แผนไทย Pimvimaan Thai Traditional Clinic · แพทย์ผู้ตรวจ: <strong>{formatDoctorDisplayName(doctorFullname)}</strong>
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
              <option value="WALK_IN">🚶 ผู้ป่วย Walk-in (บันทึกโดยตรง/ระบุช่วงเวลาตรวจ)</option>
              {availableAppointments.map((app) => (
                <option key={app.appointmentId} value={app.appointmentId}>
                  #{app.appointmentId} - {app.patientFullname} (
                  {new Date(app.slotStartTime).toLocaleDateString("th-TH")})
                </option>
              ))}
            </select>
          </div>

          {/* Select Patient */}
          <FormField
            label="ผู้ป่วย / ผู้รับบริการ"
            required
            error={errors.selectedPatientId || errors.patientId}
            id="selectedPatientId"
          >
            <select
              id="selectedPatientId"
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(Number(e.target.value));
                clearError("selectedPatientId");
                clearError("patientId");
              }}
              onBlur={() => handleBlur("selectedPatientId", selectedPatientId)}
              className={`w-full px-3 py-2 border rounded-control text-xs text-clinic-ink bg-clinic-bg/40 focus:ring-2 focus:ring-clinic-primary transition-colors ${
                errors.selectedPatientId || errors.patientId ? "border-clinic-danger focus:ring-clinic-danger" : "border-clinic-line"
              }`}
              aria-invalid={!!(errors.selectedPatientId || errors.patientId)}
            >
              <option value={0}>-- เลือกผู้ป่วย --</option>
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  HN: {p.patientId} - {p.fullname} (ID: {p.idNumber})
                </option>
              ))}
            </select>
          </FormField>

          {/* Date and Time of Visit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FormField label="วันที่มาพบแพทย์" id="visitDate">
                <DatePicker
                  value={visitDate}
                  onChange={(val) => setVisitDate(val)}
                  placeholder="เลือกวันที่มาพบแพทย์"
                />
              </FormField>
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

        {/* Walk-in Warning: No Doctor Working Schedule on Date */}
        {selectedAppointmentId === "WALK_IN" && noScheduleForDate && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-amber-900">
                  แพทย์ยังไม่มีตารางเวลาปฏิบัติงานในวันที่เลือก ({visitDate})
                </div>
                <p className="text-amber-800 mt-0.5">
                  การบันทึกการรักษาผู้ป่วย Walk-in จำเป็นต้องเชื่อมโยงกับช่วงเวลาในตารางตรวจของแพทย์ กรุณากำหนดตารางเวลาปฏิบัติงานก่อนบันทึกการรักษา
                </p>
              </div>
            </div>
            <Link
              href="/doctor/schedule"
              className="px-4 py-2 bg-clinic-primary hover:bg-clinic-primary-deep text-white font-bold text-xs rounded-control transition-all shadow-2xs shrink-0 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>กำหนดตารางตรวจที่นี่</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Walk-in Slot Selector */}
        {selectedAppointmentId === "WALK_IN" && !noScheduleForDate && (
          <div className="bg-clinic-bg/40 p-4 rounded-control border border-clinic-line space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-clinic-primary-deep flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-clinic-primary" />
                <span>เลือกช่วงเวลาตรวจของแพทย์ (Appointment Slot สำหรับผู้ป่วย Walk-in):</span>
                <span className="text-rose-500">*</span>
              </label>
              {isLoadingSlots && (
                <span className="text-[11px] text-clinic-ink-soft flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> กำลังโหลดช่วงเวลา...
                </span>
              )}
            </div>

            {walkInSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                {walkInSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.slotId;
                  const isBlocked = slot.status === "BLOCKED";
                  const isBooked = slot.status === "BOOKED";
                  const isUnavailable = isBlocked || isBooked;
                  const startTimeStr = new Date(slot.startTime).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  const endTimeStr = new Date(slot.endTime).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

                  return (
                    <button
                      key={slot.slotId}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => {
                        setSelectedSlotId(slot.slotId);
                        clearError("slotId");
                        setVisitTime(startTimeStr);
                      }}
                      className={`p-2 rounded-control border text-left text-xs transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-clinic-primary/10 border-clinic-primary ring-2 ring-clinic-primary/30 font-bold text-clinic-primary-deep shadow-2xs"
                          : isUnavailable
                          ? "bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-white border-clinic-line hover:border-clinic-primary hover:bg-clinic-primary-soft/10 text-clinic-ink cursor-pointer"
                      }`}
                    >
                      <div className="font-mono text-[11px] font-semibold flex items-center justify-between">
                        <span>{startTimeStr} - {endTimeStr}</span>
                        {isSelected && <span className="text-clinic-primary font-bold">✓</span>}
                      </div>
                      <div className="text-[9px] text-clinic-ink-soft mt-0.5">
                        {isBlocked ? "ระงับ (BLOCKED)" : isBooked ? "มีนัดหมาย (BOOKED)" : "ว่าง (AVAILABLE)"}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              !isLoadingSlots && (
                <p className="text-xs text-clinic-ink-soft italic py-1">
                  ไม่พบช่วงเวลาตรวจในตารางของแพทย์ในวันที่เลือก
                </p>
              )
            )}

            {errors.slotId && (
              <p className="text-xs text-clinic-danger font-medium mt-1">
                {errors.slotId}
              </p>
            )}
          </div>
        )}

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

          {hasExistingDhatuPrinciple ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded border border-clinic-line text-xs">
              <div>
                <span className="text-clinic-ink-soft block text-[11px]">ธาตุเจ้าเรือนหลัก (Principal Dhatu):</span>
                <strong className="text-sm text-clinic-primary-deep">
                  {DHATU_OPTIONS.find((o) => o.value === principalDhatu)?.label || principalDhatu || "-"}
                </strong>
              </div>
              <div>
                <span className="text-clinic-ink-soft block text-[11px]">ธาตุเจ้าเรือนรอง (Secondary Dhatu):</span>
                <strong className="text-sm text-clinic-primary-deep">
                  {DHATU_OPTIONS.find((o) => o.value === secondaryDhatu)?.label || secondaryDhatu || "-"}
                </strong>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ธาตุเจ้าเรือนหลัก */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-clinic-ink">
                  ธาตุเจ้าเรือนหลัก (Principal Dhatu - chao - ruan):
                </label>
                <select
                  value={principalDhatu}
                  onChange={(e) => {
                    setPrincipalDhatu(e.target.value as Dhatu);
                    clearError("principalDhatu");
                  }}
                  className="w-full px-3 py-2 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                >
                  <option value="">-- กรุณาเลือก --</option>
                  {DHATU_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} ({item.sub})
                    </option>
                  ))}
                </select>
              </div>

              {/* ธาตุเจ้าเรือนรอง */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-clinic-ink">
                  ธาตุเจ้าเรือนรอง (Secondary Dhatu - chao - ruan):
                </label>
                <select
                  value={secondaryDhatu}
                  onChange={(e) => {
                    setSecondaryDhatu(e.target.value as Dhatu);
                    clearError("secondaryDhatu");
                  }}
                  className="w-full px-3 py-2 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                >
                  <option value="">-- กรุณาเลือก --</option>
                  {DHATU_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} ({item.sub})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* อาการสำคัญ (Chief Complaint) */}
        <FormField
          label="อาการสำคัญ (Symptoms/Condition)"
          required
          error={errors.symptoms}
          id="symptoms"
        >
          <textarea
            id="symptoms"
            rows={2}
            value={symptoms}
            onChange={(e) => {
              setSymptoms(e.target.value);
              if (e.target.value.trim() && e.target.value.trim() !== "-") {
                clearError("symptoms");
              }
            }}
            onBlur={() => {
              if (!symptoms.trim()) {
                setErrors((prev) => ({ ...prev, symptoms: "กรุณาระบุอาการสำคัญ (Symptoms/Condition)" }));
              } else if (symptoms.trim() === "-") {
                setErrors((prev) => ({ ...prev, symptoms: "กรุณาระบุอาการสำคัญ ไม่สามารถใส่เพียง '-' ได้" }));
              } else {
                clearError("symptoms");
              }
            }}
            placeholder="ระบุอาการสำคัญ เช่น ปวดบ่าและสะบักข้างขวา ร้าวขึ้นคอ เป็นมา 3 วัน..."
            className={`w-full px-3 py-2 border rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 transition-colors ${
              errors.symptoms ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line focus:ring-clinic-primary"
            }`}
            aria-invalid={!!errors.symptoms}
          />
        </FormField>

        {/* ประวัติปัจจุบัน (Present History) */}
        <div>
          <label className="block text-xs font-semibold text-clinic-ink mb-1">
            ประวัติปัจจุบัน (Present History)
          </label>
          <textarea
            rows={2}
            value={presentHistory}
            onChange={(e) => {
              setPresentHistory(e.target.value);
              if (e.target.value.trim()) clearError("presentHistory");
            }}
            onBlur={() => handleTextBlur("presentHistory", presentHistory)}
            placeholder="ประวัติการเจ็บป่วยในปัจจุบัน อาการกำเริบเมื่อใด สิ่งที่ทำให้ทุเลาหรือรุนแรงขึ้น หรือใส่ '-'..."
            className={`w-full px-3 py-2 border rounded-control text-xs text-clinic-ink bg-clinic-bg/30 focus:ring-2 transition-colors ${
              errors.presentHistory
                ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20"
                : "border-clinic-line focus:ring-clinic-primary"
            }`}
          />
          {renderError("presentHistory")}
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
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="ระบุโรคประจำตัว หรือใส่ '-'..."
                      value={underlyingDiseaseDetails}
                      onChange={(e) => {
                        setUnderlyingDiseaseDetails(e.target.value);
                        if (e.target.value.trim()) clearError("underlyingDiseaseDetails");
                      }}
                      onBlur={() => handleTextBlur("underlyingDiseaseDetails", underlyingDiseaseDetails)}
                      className={`w-full px-2 py-1 text-xs border rounded bg-white ${
                        errors.underlyingDiseaseDetails ? "border-clinic-danger" : "border-clinic-line"
                      }`}
                    />
                    {renderError("underlyingDiseaseDetails")}
                  </div>
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
                        clearError("drugAllergyDetails");
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
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="ระบุยาที่แพ้และอาการ หรือใส่ '-'..."
                      value={drugAllergyDetails}
                      onChange={(e) => {
                        setDrugAllergyDetails(e.target.value);
                        if (e.target.value.trim()) clearError("drugAllergyDetails");
                      }}
                      onBlur={() => handleTextBlur("drugAllergyDetails", drugAllergyDetails)}
                      className={`w-full px-2 py-1 text-xs border rounded bg-white text-rose-700 ${
                        errors.drugAllergyDetails ? "border-clinic-danger" : "border-clinic-line"
                      }`}
                    />
                    {renderError("drugAllergyDetails")}
                  </div>
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
                        clearError("foodAllergyDetails");
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
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="ระบุอาหารที่แพ้ หรือใส่ '-'..."
                      value={foodAllergyDetails}
                      onChange={(e) => {
                        setFoodAllergyDetails(e.target.value);
                        if (e.target.value.trim()) clearError("foodAllergyDetails");
                      }}
                      onBlur={() => handleTextBlur("foodAllergyDetails", foodAllergyDetails)}
                      className={`w-full px-2 py-1 text-xs border rounded bg-white text-amber-700 ${
                        errors.foodAllergyDetails ? "border-clinic-danger" : "border-clinic-line"
                      }`}
                    />
                    {renderError("foodAllergyDetails")}
                  </div>
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
                    clearError("familyDiseaseDetails");
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
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    placeholder="ระบุโรคทางพันธุกรรมในครอบครัว หรือใส่ '-'..."
                    value={familyDiseaseDetails}
                    onChange={(e) => {
                      setFamilyDiseaseDetails(e.target.value);
                      if (e.target.value.trim()) clearError("familyDiseaseDetails");
                    }}
                    onBlur={() => handleTextBlur("familyDiseaseDetails", familyDiseaseDetails)}
                    className={`w-full px-2.5 py-1 text-xs border rounded bg-white ${
                      errors.familyDiseaseDetails ? "border-clinic-danger" : "border-clinic-line"
                    }`}
                  />
                  {renderError("familyDiseaseDetails")}
                </div>
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

            {/* วิถีชีวิตและกิจวัตรประจำวัน (Lifestyle) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-clinic-ink">
                วิถีชีวิตและกิจวัตรประจำวัน (Lifestyle Habits / Daily Routine):
              </label>
              <textarea
                rows={2}
                value={personalHistory}
                onChange={(e) => {
                  setPersonalHistory(e.target.value);
                  if (e.target.value.trim()) clearError("personalHistory");
                }}
                onBlur={() => handleTextBlur("personalHistory", personalHistory)}
                placeholder="เช่น เวลาตื่นนอน การรับประทานอาหารกี่มื้อ การอาบน้ำ กิจวัตรประจำวัน หรือใส่ '-'..."
                className={`w-full px-3 py-1.5 border rounded-control text-xs bg-white focus:ring-2 transition-colors ${
                  errors.personalHistory
                    ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20"
                    : "border-clinic-line focus:ring-clinic-primary"
                }`}
              />
              {renderError("personalHistory")}
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
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setTemp(val);
                if (val !== "") clearError("temp");
              }}
              onBlur={() => handleVitalBlur("temp", temp)}
              placeholder="เช่น 36.5 หรือ 0"
              className={`w-full px-3 py-1.5 border rounded-control text-xs font-mono bg-clinic-bg/30 transition-colors ${
                errors.temp ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("temp")}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              ชีพจร Pulse (Beats/min)
            </label>
            <input
              type="number"
              value={pulse}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setPulse(val);
                if (val !== "") clearError("pulse");
              }}
              onBlur={() => handleVitalBlur("pulse", pulse)}
              placeholder="เช่น 76 หรือ 0"
              className={`w-full px-3 py-1.5 border rounded-control text-xs font-mono bg-clinic-bg/30 transition-colors ${
                errors.pulse ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("pulse")}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              การหายใจ RR (Breaths/min)
            </label>
            <input
              type="number"
              value={respirationRate}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setRespirationRate(val);
                if (val !== "") clearError("respirationRate");
              }}
              onBlur={() => handleVitalBlur("respirationRate", respirationRate)}
              placeholder="เช่น 18 หรือ 0"
              className={`w-full px-3 py-1.5 border rounded-control text-xs font-mono bg-clinic-bg/30 transition-colors ${
                errors.respirationRate ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("respirationRate")}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              ความดันโลหิต BP (mmHg)
            </label>
            <input
              type="text"
              value={bp}
              onChange={(e) => {
                setBp(e.target.value);
                if (e.target.value.trim()) clearError("bp");
              }}
              onBlur={() => handleTextBlur("bp", bp)}
              placeholder="เช่น 120/80 หรือ -"
              className={`w-full px-3 py-1.5 border rounded-control text-xs font-mono bg-clinic-bg/30 transition-colors ${
                errors.bp ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("bp")}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              ส่วนสูง Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setHeight(val);
                if (val !== "") clearError("height");
              }}
              onBlur={() => handleVitalBlur("height", height)}
              placeholder="เช่น 165 หรือ 0"
              className={`w-full px-3 py-1.5 border rounded-control text-xs font-mono bg-clinic-bg/30 transition-colors ${
                errors.height ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("height")}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-clinic-ink-soft mb-1">
              น้ำหนัก Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setWeight(val);
                if (val !== "") clearError("weight");
              }}
              onBlur={() => handleVitalBlur("weight", weight)}
              placeholder="เช่น 60 หรือ 0"
              className={`w-full px-3 py-1.5 border rounded-control text-xs font-mono bg-clinic-bg/30 transition-colors ${
                errors.weight ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("weight")}
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-clinic-primary-deep font-mono">
                {painScoreBefore !== null ? `${painScoreBefore} / 10` : "ยังไม่ได้ประเมิน"}
              </span>
              {painScoreBefore !== null && (
                <button
                  type="button"
                  onClick={() => setPainScoreBefore(null)}
                  className="text-[10px] text-clinic-ink-soft hover:text-rose-600 underline cursor-pointer"
                >
                  ล้างค่า
                </button>
              )}
            </div>
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
              onChange={(e) => {
                setModernDiagnosis(e.target.value);
                if (e.target.value.trim()) clearError("modernDiagnosis");
              }}
              onBlur={() => handleTextBlur("modernDiagnosis", modernDiagnosis)}
              placeholder="เช่น Myofascial Pain Syndrome หรือใส่ '-' หากไม่มีข้อมูล..."
              className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 transition-colors ${
                errors.modernDiagnosis ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("modernDiagnosis")}
          </div>

          <div>
            <label className="block text-xs font-semibold text-clinic-ink mb-1">
              อาการเพิ่มเติม (Additional Symptoms)
            </label>
            <input
              type="text"
              value={additionalSymptoms}
              onChange={(e) => {
                setAdditionalSymptoms(e.target.value);
                if (e.target.value.trim()) clearError("additionalSymptoms");
              }}
              onBlur={() => handleTextBlur("additionalSymptoms", additionalSymptoms)}
              placeholder="อาการตรวจพบเพิ่มเติม เช่น มีจุดกดเจ็บบริเวณสะบัก หรือใส่ '-'..."
              className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 transition-colors ${
                errors.additionalSymptoms ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("additionalSymptoms")}
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
                    onChange={(e) => {
                      setBicepRT(e.target.value);
                      if (e.target.value.trim()) clearError("bicepRT");
                    }}
                    onBlur={() => handleTextBlur("bicepRT", bicepRT)}
                    placeholder="-"
                    className={`w-full px-2 py-0.5 text-xs border rounded text-center bg-white ${
                      errors.bicepRT ? "border-clinic-danger" : "border-clinic-line"
                    }`}
                  />
                  {renderError("bicepRT")}
                </div>
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">LT:</span>
                  <input
                    type="text"
                    value={bicepLT}
                    onChange={(e) => {
                      setBicepLT(e.target.value);
                      if (e.target.value.trim()) clearError("bicepLT");
                    }}
                    onBlur={() => handleTextBlur("bicepLT", bicepLT)}
                    placeholder="-"
                    className={`w-full px-2 py-0.5 text-xs border rounded text-center bg-white ${
                      errors.bicepLT ? "border-clinic-danger" : "border-clinic-line"
                    }`}
                  />
                  {renderError("bicepLT")}
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
                    onChange={(e) => {
                      setTricepsRT(e.target.value);
                      if (e.target.value.trim()) clearError("tricepsRT");
                    }}
                    onBlur={() => handleTextBlur("tricepsRT", tricepsRT)}
                    placeholder="-"
                    className={`w-full px-2 py-0.5 text-xs border rounded text-center bg-white ${
                      errors.tricepsRT ? "border-clinic-danger" : "border-clinic-line"
                    }`}
                  />
                  {renderError("tricepsRT")}
                </div>
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">LT:</span>
                  <input
                    type="text"
                    value={tricepsLT}
                    onChange={(e) => {
                      setTricepsLT(e.target.value);
                      if (e.target.value.trim()) clearError("tricepsLT");
                    }}
                    onBlur={() => handleTextBlur("tricepsLT", tricepsLT)}
                    placeholder="-"
                    className={`w-full px-2 py-0.5 text-xs border rounded text-center bg-white ${
                      errors.tricepsLT ? "border-clinic-danger" : "border-clinic-line"
                    }`}
                  />
                  {renderError("tricepsLT")}
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
                    onChange={(e) => {
                      setKneeRT(e.target.value);
                      if (e.target.value.trim()) clearError("kneeRT");
                    }}
                    onBlur={() => handleTextBlur("kneeRT", kneeRT)}
                    placeholder="-"
                    className={`w-full px-2 py-0.5 text-xs border rounded text-center bg-white ${
                      errors.kneeRT ? "border-clinic-danger" : "border-clinic-line"
                    }`}
                  />
                  {renderError("kneeRT")}
                </div>
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">LT:</span>
                  <input
                    type="text"
                    value={kneeLT}
                    onChange={(e) => {
                      setKneeLT(e.target.value);
                      if (e.target.value.trim()) clearError("kneeLT");
                    }}
                    onBlur={() => handleTextBlur("kneeLT", kneeLT)}
                    placeholder="-"
                    className={`w-full px-2 py-0.5 text-xs border rounded text-center bg-white ${
                      errors.kneeLT ? "border-clinic-danger" : "border-clinic-line"
                    }`}
                  />
                  {renderError("kneeLT")}
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
                    onChange={(e) => {
                      setAnkleRT(e.target.value);
                      if (e.target.value.trim()) clearError("ankleRT");
                    }}
                    onBlur={() => handleTextBlur("ankleRT", ankleRT)}
                    placeholder="-"
                    className={`w-full px-2 py-0.5 text-xs border rounded text-center bg-white ${
                      errors.ankleRT ? "border-clinic-danger" : "border-clinic-line"
                    }`}
                  />
                  {renderError("ankleRT")}
                </div>
                <div>
                  <span className="text-[10px] text-clinic-ink-soft">LT:</span>
                  <input
                    type="text"
                    value={ankleLT}
                    onChange={(e) => {
                      setAnkleLT(e.target.value);
                      if (e.target.value.trim()) clearError("ankleLT");
                    }}
                    onBlur={() => handleTextBlur("ankleLT", ankleLT)}
                    placeholder="-"
                    className={`w-full px-2 py-0.5 text-xs border rounded text-center bg-white ${
                      errors.ankleLT ? "border-clinic-danger" : "border-clinic-line"
                    }`}
                  />
                  {renderError("ankleLT")}
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
            onChange={(e) => {
              setMenstruationHistory(e.target.value);
              if (e.target.value.trim()) clearError("menstruationHistory");
            }}
            onBlur={() => handleTextBlur("menstruationHistory", menstruationHistory)}
            placeholder="เช่น รอบเดือนมาสม่ำเสมอ หรือใส่ '-' หากไม่มีข้อมูล/ผู้ป่วยชาย..."
            className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 transition-colors ${
              errors.menstruationHistory ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
            }`}
          />
          {renderError("menstruationHistory")}
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

          {hasExistingDhatuPrinciple ? (
            <div className="bg-white p-4 rounded border border-clinic-line space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● ธาตุสมุฏฐาน (Elementary):</span>
                  <div className="text-[11px] text-clinic-ink space-y-0.5">
                    <div>กำเนิด/ตอนเกิด: <strong>{DHATU_OPTIONS.find((o) => o.value === conceptionDhatu)?.label || conceptionDhatu || "-"}</strong></div>
                    <div>ปฏิสนธิลักษณะ: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === conceptionCharacteristic)?.label || conceptionCharacteristic || "-"}</strong></div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● อุตุสมุฏฐาน (Seasonal):</span>
                  <div className="text-[11px] text-clinic-ink space-y-0.5">
                    <div>เมื่อเริ่มเจ็บป่วย: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === seasonalOnset)?.label || seasonalOnset || "-"}</strong></div>
                    <div>เมื่อมาพบแพทย์: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === seasonalCurrent)?.label || seasonalCurrent || "-"}</strong></div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● อายุสมุฏฐาน (Age):</span>
                  <div className="text-[11px] text-clinic-ink">
                    ช่วงวัย: <strong>{AGE_OPTIONS.find((o) => o.value === agePrinciple)?.label || agePrinciple || "-"}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● กาลสมุฏฐาน (Time):</span>
                  <div className="text-[11px] text-clinic-ink space-y-0.5">
                    <div>เมื่ออาการกำเริบ: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === timeOnset)?.label || timeOnset || "-"}</strong></div>
                    <div>เมื่อมาพบแพทย์: <strong>{TRIDOSHA_OPTIONS.find((o) => o.value === timeCurrent)?.label || timeCurrent || "-"}</strong></div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold text-clinic-primary-deep block mb-1">● ประเทศสมุฏฐาน (Geographical):</span>
                  <div className="text-[11px] text-clinic-ink space-y-0.5">
                    <div>ภูมิลำเนาเกิด: <strong>{DHATU_OPTIONS.find((o) => o.value === geoBirthplace)?.label || geoBirthplace || "-"}</strong></div>
                    <div>ที่อยู่ปัจจุบัน: <strong>{DHATU_OPTIONS.find((o) => o.value === geoCurrent)?.label || geoCurrent || "-"}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-white p-4 rounded border border-clinic-line">
              {/* 1. ธาตุสมุฏฐาน */}
              <div className="space-y-1.5">
                <span className="font-bold text-clinic-ink block">● ธาตุสมุฏฐาน (Elementary principles)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                  <div>
                    <label className="text-[11px] text-clinic-ink-soft block mb-1">ปฏิสนธิ/ตอนเกิด (Dhatu):</label>
                    <select
                      value={conceptionDhatu}
                      onChange={(e) => setConceptionDhatu(e.target.value as Dhatu | "")}
                      className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                    >
                      <option value="">-- กรุณาเลือก --</option>
                      {DHATU_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label} ({item.sub})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-clinic-ink-soft block mb-1">ปฏิสนธิลักษณะ (TriDosha):</label>
                    <select
                      value={conceptionCharacteristic}
                      onChange={(e) => setConceptionCharacteristic(e.target.value as TriDosha | "")}
                      className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                    >
                      <option value="">-- กรุณาเลือก --</option>
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label} ({item.sub})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. อุตุสมุฏฐาน */}
              <div className="space-y-1.5 pt-2 border-t border-clinic-line/60">
                <span className="font-bold text-clinic-ink block">● อุตุสมุฏฐาน (Seasonal principles)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                  <div>
                    <label className="text-[11px] text-clinic-ink-soft block mb-1">เมื่อเริ่มเจ็บป่วย:</label>
                    <select
                      value={seasonalOnset}
                      onChange={(e) => setSeasonalOnset(e.target.value as TriDosha | "")}
                      className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                    >
                      <option value="">-- กรุณาเลือก --</option>
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label} ({item.sub})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-clinic-ink-soft block mb-1">เมื่อมาพบแพทย์:</label>
                    <select
                      value={seasonalCurrent}
                      onChange={(e) => setSeasonalCurrent(e.target.value as TriDosha | "")}
                      className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                    >
                      <option value="">-- กรุณาเลือก --</option>
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label} ({item.sub})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. อายุสมุฏฐาน */}
              <div className="space-y-1.5 pt-2 border-t border-clinic-line/60">
                <span className="font-bold text-clinic-ink block">● อายุสมุฏฐาน (Age principles)</span>
                <div className="pl-3 max-w-sm">
                  <label className="text-[11px] text-clinic-ink-soft block mb-1">ช่วงวัย:</label>
                  <select
                    value={agePrinciple}
                    onChange={(e) => setAgePrinciple(e.target.value as AgePrinciple | "")}
                    className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                  >
                    <option value="">-- กรุณาเลือก --</option>
                    {AGE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label} ({item.sub})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. กาลสมุฏฐาน */}
              <div className="space-y-1.5 pt-2 border-t border-clinic-line/60">
                <span className="font-bold text-clinic-ink block">● กาลสมุฏฐาน (Time principles)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                  <div>
                    <label className="text-[11px] text-clinic-ink-soft block mb-1">เมื่ออาการกำเริบ:</label>
                    <select
                      value={timeOnset}
                      onChange={(e) => setTimeOnset(e.target.value as TriDosha | "")}
                      className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                    >
                      <option value="">-- กรุณาเลือก --</option>
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label} ({item.sub})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-clinic-ink-soft block mb-1">เมื่อมาพบแพทย์:</label>
                    <select
                      value={timeCurrent}
                      onChange={(e) => setTimeCurrent(e.target.value as TriDosha | "")}
                      className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                    >
                      <option value="">-- กรุณาเลือก --</option>
                      {TRIDOSHA_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label} ({item.sub})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. ประเทศสมุฏฐาน */}
              <div className="space-y-1.5 pt-2 border-t border-clinic-line/60">
                <span className="font-bold text-clinic-ink block">● ประเทศสมุฏฐาน (Geographical principles)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                  <div>
                    <label className="text-[11px] text-clinic-ink-soft block mb-1">ภูมิลำเนา (Place of birth):</label>
                    <select
                      value={geoBirthplace}
                      onChange={(e) => setGeoBirthplace(e.target.value as Dhatu | "")}
                      className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                    >
                      <option value="">-- กรุณาเลือก --</option>
                      {DHATU_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label} ({item.sub})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-clinic-ink-soft block mb-1">ปัจจุบัน (Present address):</label>
                    <select
                      value={geoCurrent}
                      onChange={(e) => setGeoCurrent(e.target.value as Dhatu | "")}
                      className="w-full px-3 py-1.5 border border-clinic-line rounded text-xs bg-white focus:ring-2 focus:ring-clinic-primary"
                    >
                      <option value="">-- กรุณาเลือก --</option>
                      {DHATU_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label} ({item.sub})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* มูลเหตุการเกิดโรค (Cause of symptoms Checkboxes) */}
        <div className={`space-y-2 p-3 rounded-control border transition-colors ${
          errors.causesOfSymptoms ? "border-clinic-danger bg-red-50/10" : "border-transparent"
        }`}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-clinic-ink">
              มูลเหตุการเกิดโรค (Cause of symptoms): <span className="text-red-500">* (เลือกอย่างน้อย 1 อย่าง)</span>
            </label>
            {errors.causesOfSymptoms && (
              <span className="text-xs text-clinic-danger font-medium">
                {errors.causesOfSymptoms}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={causeFood}
                onChange={(e) => {
                  setCauseFood(e.target.checked);
                  clearError("causesOfSymptoms");
                }}
                className="rounded text-clinic-primary"
              />
              <span>อาหาร (Food)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={causePosition}
                onChange={(e) => {
                  setCausePosition(e.target.checked);
                  clearError("causesOfSymptoms");
                }}
                className="rounded text-clinic-primary"
              />
              <span>อิริยาบถ (Position)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={causeWeather}
                onChange={(e) => {
                  setCauseWeather(e.target.checked);
                  clearError("causesOfSymptoms");
                }}
                className="rounded text-clinic-primary"
              />
              <span>ความร้อน-ความเย็น</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={causeFastingSleep}
                onChange={(e) => {
                  setCauseFastingSleep(e.target.checked);
                  clearError("causesOfSymptoms");
                }}
                className="rounded text-clinic-primary"
              />
              <span>อดนอน อดข้าว อดน้ำ</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={causeIncontinence}
                onChange={(e) => {
                  setCauseIncontinence(e.target.checked);
                  clearError("causesOfSymptoms");
                }}
                className="rounded text-clinic-primary"
              />
              <span>กลั้นอุจจาระปัสสาวะ</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={causeWorkHard}
                onChange={(e) => {
                  setCauseWorkHard(e.target.checked);
                  clearError("causesOfSymptoms");
                }}
                className="rounded text-clinic-primary"
              />
              <span>ทำงานเกินกำลัง</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={causeSadness}
                onChange={(e) => {
                  setCauseSadness(e.target.checked);
                  clearError("causesOfSymptoms");
                }}
                className="rounded text-clinic-primary"
              />
              <span>ความเศร้าโศกเสียใจ</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={causeWrath}
                onChange={(e) => {
                  setCauseWrath(e.target.checked);
                  clearError("causesOfSymptoms");
                }}
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
              onChange={(e) => {
                setCauseOther(e.target.value);
                if (e.target.value.trim()) clearError("causesOfSymptoms");
              }}
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
              onChange={(e) => {
                setSummaryOfSickness(e.target.value);
                if (e.target.value.trim()) clearError("summaryOfSickness");
              }}
              onBlur={() => handleTextBlur("summaryOfSickness", summaryOfSickness)}
              placeholder="สรุปภาพรวมความเจ็บป่วยและสาเหตุ หรือใส่ '-'..."
              className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 transition-colors ${
                errors.summaryOfSickness ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("summaryOfSickness")}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-clinic-ink mb-1">
                สมุฏฐานธาตุพิการ (Diagnosis based on the four elements)
              </label>
              <input
                type="text"
                value={diagnosisElements}
                onChange={(e) => {
                  setDiagnosisElements(e.target.value);
                  if (e.target.value.trim()) clearError("diagnosisElements");
                }}
                onBlur={() => handleTextBlur("diagnosisElements", diagnosisElements)}
                placeholder="เช่น ธาตุดินพิการ, ลมกองหยาบ หรือใส่ '-'..."
                className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 font-medium transition-colors ${
                  errors.diagnosisElements ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
                }`}
              />
              {renderError("diagnosisElements")}
            </div>

            <div>
              <label className="block text-xs font-bold text-clinic-primary-deep mb-1">
                การวินิจฉัยโรค ทางแพทย์แผนไทย/รหัสโรค (TTM Diagnosis) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ttmDiagnosis}
                onChange={(e) => {
                  setTtmDiagnosis(e.target.value);
                  if (e.target.value.trim()) clearError("ttmDiagnosis");
                }}
                onBlur={() => handleTextBlur("ttmDiagnosis", ttmDiagnosis)}
                placeholder="เช่น โรคลมปลายปัตฆาตสัญญาณ 4-5, ลมจับโปงแห้งเข่า หรือใส่ '-'..."
                className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 font-bold text-clinic-primary-deep transition-colors ${
                  errors.ttmDiagnosis ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
                }`}
                required
              />
              {renderError("ttmDiagnosis")}
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
            onChange={(e) => {
              setTreatmentPlan(e.target.value);
              if (e.target.value.trim()) clearError("treatmentPlan");
            }}
            onBlur={() => handleTextBlur("treatmentPlan", treatmentPlan)}
            placeholder="ระบุแผนการรักษา เช่น นวดแก้อาการและประคบสมุนไพรสด หรือใส่ '-'..."
            className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 focus:ring-2 transition-colors ${
              errors.treatmentPlan ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line focus:ring-clinic-primary"
            }`}
          />
          {renderError("treatmentPlan")}
        </div>

        {/* วิธีการ (Treatment program Checkboxes) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-clinic-ink">
            ๒. วิธีการรักษา / หัตถการ (Treatment program):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <label className="inline-flex items-center gap-2 p-2.5 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={programCompress}
                onChange={(e) => setProgramCompress(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>ประคบสมุนไพร (Herbal compress)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2.5 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={programSteam}
                onChange={(e) => setProgramSteam(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>อบสมุนไพร (Herbal steam)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2.5 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
              <input
                type="checkbox"
                checked={programHerbalMed}
                onChange={(e) => setProgramHerbalMed(e.target.checked)}
                className="rounded text-clinic-primary"
              />
              <span>จ่ายยาสมุนไพร (Prescription)</span>
            </label>

            <label className="inline-flex items-center gap-2 p-2.5 bg-clinic-bg/40 border border-clinic-line rounded cursor-pointer hover:bg-clinic-bg/60">
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
                placeholder="ระบุรายละเอียดหัตถการ เช่น นวดกดจุดแก้อาการสัญญาณ 4-5 ศีรษะและบ่า หรือใส่ '-'..."
                value={programMassageDetails}
                onChange={(e) => {
                  setProgramMassageDetails(e.target.value);
                  if (e.target.value.trim()) clearError("programMassageDetails");
                }}
                onBlur={() => handleTextBlur("programMassageDetails", programMassageDetails)}
                className={`w-full px-3 py-1.5 border rounded text-xs bg-clinic-bg/30 transition-colors ${
                  errors.programMassageDetails ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
                }`}
              />
              {renderError("programMassageDetails")}
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
            onChange={(e) => {
              setEvalAfterTreatment(e.target.value);
              if (e.target.value.trim()) clearError("evalAfterTreatment");
            }}
            onBlur={() => handleTextBlur("evalAfterTreatment", evalAfterTreatment)}
            placeholder="เช่น กล้ามเนื้อคลายตัว ความตึงตัวลดลง หรือใส่ '-'..."
            className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 transition-colors ${
              errors.evalAfterTreatment ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
            }`}
          />
          {renderError("evalAfterTreatment")}
        </div>

        {/* Pain Score Assessment (หลังการรักษา) */}
        <div className="space-y-3 pt-3 border-t border-clinic-line">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-clinic-ink flex items-center gap-1.5">
              <span>✨ ระดับความปวด (หลังการรักษา) Pain score (After treatment)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {painScoreAfter !== null ? (
                  <>
                    {painScoreAfter} / 10{" "}
                    {painScoreBefore !== null && painScoreBefore - painScoreAfter > 0 && (
                      <span className="text-xs font-bold text-emerald-600 ml-1">
                        (ความปวดลดลง {painScoreBefore - painScoreAfter} ระดับ)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-clinic-ink-soft font-normal text-xs">(ยังไม่ได้ประเมิน)</span>
                )}
              </span>
              {painScoreAfter !== null && (
                <button
                  type="button"
                  onClick={() => setPainScoreAfter(null)}
                  className="text-[11px] text-clinic-ink-soft hover:text-clinic-danger underline ml-2 cursor-pointer"
                >
                  ล้างค่า
                </button>
              )}
            </div>
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
              onChange={(e) => {
                setSuggestions(e.target.value);
                if (e.target.value.trim()) clearError("suggestions");
              }}
              onBlur={() => handleTextBlur("suggestions", suggestions)}
              placeholder="คำแนะนำการปฏิบัติตัว ท่าบริหารยืดเหยียด หรือใส่ '-'..."
              className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 transition-colors ${
                errors.suggestions ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("suggestions")}
          </div>

          <div>
            <label className="block text-xs font-bold text-clinic-ink mb-1">
              ๔. นัดหมายเพื่อติดตามผลการรักษา (Follow up)
            </label>
            <textarea
              rows={2}
              value={followup}
              onChange={(e) => {
                setFollowup(e.target.value);
                if (e.target.value.trim()) clearError("followup");
              }}
              onBlur={() => handleTextBlur("followup", followup)}
              placeholder="เช่น นัดติดตามผลในอีก 1 สัปดาห์ หรือใส่ '-'..."
              className={`w-full px-3 py-2 border rounded-control text-xs bg-clinic-bg/30 transition-colors ${
                errors.followup ? "border-clinic-danger focus:ring-clinic-danger bg-red-50/20" : "border-clinic-line"
              }`}
            />
            {renderError("followup")}
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
                เลือกยาสมุนไพร / เวชภัณฑ์ (ค้นหาแบบ Real-time)
              </label>
              <MedicineCombobox
                medicines={medicines}
                selectedMedicineId={selectedMedId}
                onSelectMedicine={(med) => setSelectedMedId(med.medicineId)}
                onClear={() => setSelectedMedId(0)}
                placeholder="พิมพ์ค้นหาชื่อยา, รหัส, หรือหมวดหมู่..."
              />
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

        {/* Dynamic Additional Items (Custom Fees / Services) */}
        <div className="pt-4 border-t border-clinic-line space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-xs text-clinic-primary-deep block">
                ➕ รายการค่าบริการและค่าใช้จ่ายเพิ่มเติม (Custom Fee Items)
              </span>
              <p className="text-[11px] text-clinic-ink-soft">
                แพทย์สามารถกดเพิ่มรายการ ระบุชื่อค่าบริการ และใส่ราคาได้เองตามความเหมาะสม
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddCustomItem("", 100)}
              className="px-3 py-1.5 rounded-control text-xs font-bold text-clinic-primary bg-clinic-primary-soft hover:bg-clinic-primary/20 transition-all border border-clinic-primary/30 cursor-pointer self-start sm:self-auto"
            >
              + เพิ่มรายการค่าบริการ (Add Item)
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span className="text-[11px] text-clinic-ink-soft font-semibold">ปุ่มลัดช่วยกรอก:</span>
            <button
              type="button"
              onClick={() => handleAddCustomItem("ค่าบริการทางการแพทย์ (Doctor's Fee)", 100)}
              className="px-2 py-0.5 rounded bg-clinic-bg border border-clinic-line text-clinic-ink hover:bg-clinic-primary-soft hover:text-clinic-primary text-[11px] transition-colors cursor-pointer"
            >
              + ค่าตรวจ (Doctor Fee 100.-)
            </button>
            <button
              type="button"
              onClick={() => handleAddCustomItem("ค่าจัดส่งพัสดุยา (Registered Mail)", 35)}
              className="px-2 py-0.5 rounded bg-clinic-bg border border-clinic-line text-clinic-ink hover:bg-clinic-primary-soft hover:text-clinic-primary text-[11px] transition-colors cursor-pointer"
            >
              + ค่าส่งยา (Mail 35.-)
            </button>
            <button
              type="button"
              onClick={() => handleAddCustomItem("ค่าหัตถการนวดรักษา (Procedure Fee)", 300)}
              className="px-2 py-0.5 rounded bg-clinic-bg border border-clinic-line text-clinic-ink hover:bg-clinic-primary-soft hover:text-clinic-primary text-[11px] transition-colors cursor-pointer"
            >
              + ค่านวดรักษา (300.-)
            </button>
            <button
              type="button"
              onClick={() => handleAddCustomItem("ค่าประคบสมุนไพร (Herbal Compress)", 150)}
              className="px-2 py-0.5 rounded bg-clinic-bg border border-clinic-line text-clinic-ink hover:bg-clinic-primary-soft hover:text-clinic-primary text-[11px] transition-colors cursor-pointer"
            >
              + ค่าประคบสมุนไพร (150.-)
            </button>
          </div>

          {/* Additional Items List */}
          {additionalItems.length > 0 ? (
            <div className="space-y-2 pt-1">
              {additionalItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-control bg-clinic-bg/40 border border-clinic-line"
                >
                  <span className="text-xs font-mono text-clinic-ink-soft w-6 text-center">{idx + 1}.</span>
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) => handleCustomItemChange(item.id, "itemName", e.target.value)}
                    placeholder="ระบุชื่อรายการ เช่น ค่าบริการตรวจ, ค่าส่งไปรษณีย์..."
                    className="flex-1 px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-white"
                  />
                  <div className="flex items-center gap-1 w-36">
                    <span className="text-xs text-clinic-ink-soft">฿</span>
                    <input
                      type="number"
                      min={0}
                      value={item.amount}
                      onChange={(e) => handleCustomItemChange(item.id, "amount", Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-white font-mono text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomItem(item.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    title="ลบรายการ"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="text-right text-xs font-semibold text-clinic-ink-soft pt-1">
                รวมค่าบริการเพิ่มเติม: <span className="font-mono text-clinic-primary-deep font-bold">฿{additionalItemsTotal.toLocaleString()}</span> บาท
              </div>
            </div>
          ) : (
            <p className="text-xs text-clinic-ink-soft italic py-2">ไม่มีรายการค่าบริการเพิ่มเติม</p>
          )}
        </div>

        {/* Payment details & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-clinic-line">
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

          <div>
            <label className="block text-xs font-semibold text-clinic-ink-soft mb-1">
              หมายเหตุการเงิน (Billing Note)
            </label>
            <input
              type="text"
              value={billingNote}
              onChange={(e) => setBillingNote(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม เช่น จัดส่งยาทางไปรษณีย์..."
              className="w-full px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/30"
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Submit Bar */}
      <div className="bg-white border border-clinic-line rounded-card p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="text-xs text-clinic-ink-soft space-y-1">
          <p className="font-semibold text-clinic-ink flex flex-wrap items-center gap-1.5">
            <span>ยอดรวมค่ารักษาและยาสมุนไพร:</span>
            <span className="font-mono text-lg font-bold text-clinic-primary-deep">
              ฿{grandTotal.toLocaleString()}
            </span>
            <span>บาท</span>
            {medicalRights !== "PAY" && (
              <span className="text-emerald-700 font-bold ml-1 text-xs">(ยกเว้นค่ารักษาพยาบาล)</span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-clinic-ink-soft">
            <span>💊 ค่ายาสมุนไพร: <strong className="font-mono text-clinic-ink">฿{medicinesTotal.toLocaleString()}</strong></span>
            <span>•</span>
            <span>➕ ค่าบริการ/อื่นๆ: <strong className="font-mono text-clinic-ink">฿{additionalItemsTotal.toLocaleString()}</strong></span>
          </div>
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
            disabled={isPending || isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-control text-sm font-bold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending || isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังบันทึกเวชระเบียน…</span>
              </>
            ) : (
              <span>✓ บันทึกเวชระเบียนและออกใบสั่งการรักษา</span>
            )}
          </button>
        </div>
      </div>

      {/* No Doctor Working Schedule Dialog */}
      <Dialog open={showNoScheduleDialog} onOpenChange={setShowNoScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-900 font-display">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>ยังไม่มีตารางเวลาปฏิบัติงานของแพทย์</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-clinic-ink-soft leading-relaxed pt-1">
              แพทย์ยังไม่มีตารางเวลาปฏิบัติงานในวันที่เลือก ({visitDate}) ระบบกำหนดให้การบันทึกการรักษาผู้ป่วย Walk-in ต้องผูกกับช่วงเวลาตรวจในตารางปฏิบัติงานจริง กรุณากำหนดตารางเวลาปฏิบัติงานก่อนบันทึกการรักษา
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-xs text-clinic-ink space-y-2">
            <p>
              ท่านสามารถไปยังหน้าจัดการตารางตรวจ เพื่อสร้างตารางปฏิบัติงานประจำวันหรือสร้างรอบสัปดาห์ (Weekly Batch) ได้ทันที
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setShowNoScheduleDialog(false)}
              className="px-4 py-2 rounded-control text-xs font-semibold text-clinic-ink bg-clinic-bg border border-clinic-line hover:bg-slate-100"
            >
              ปิด
            </button>
            <Link
              href="/doctor/schedule"
              className="px-4 py-2 rounded-control text-xs font-bold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>ไปที่หน้ากำหนดตารางตรวจ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
