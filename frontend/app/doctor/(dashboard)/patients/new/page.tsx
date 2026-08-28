"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  ContactPersonRequestDTO,
  Gender,
  IdType,
  MaritalStatus,
  BloodGroupAbo,
  BloodGroupRh,
  HouseholdStatus,
  TreatmentRights,
  PatientRequestDTO,
} from "@/lib/types";
// Local UI helpers
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-card border border-clinic-line ${className}`}>{children}</div>;
}
function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}
function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={className}>{children}</h2>;
}
function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
}
function Button({
  children,
  type = "button",
  variant = "default",
  size = "md",
  disabled,
  onClick,
  className = "",
  asChild,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "outline" | "terracotta";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  asChild?: boolean;
}) {
  const variantStyles =
    variant === "terracotta"
      ? "bg-clinic-terracotta text-white hover:bg-clinic-terracotta-deep"
      : variant === "outline"
      ? "bg-white border border-clinic-line text-clinic-ink hover:bg-clinic-bg"
      : "bg-clinic-primary text-white hover:bg-clinic-primary-deep";
  const sizeStyles = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  if (asChild) {
    return <span className={`inline-flex items-center justify-center rounded-control font-semibold transition-all ${variantStyles} ${sizeStyles} ${className}`}>{children}</span>;
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-control font-semibold transition-all disabled:opacity-50 ${variantStyles} ${sizeStyles} ${className}`}
    >
      {children}
    </button>
  );
}
import {
  User,
  CreditCard,
  HeartPulse,
  MapPin,
  Users,
  Phone,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Globe,
  Sparkles,
} from "lucide-react";

const PROVINCES = [
  "แม่ฮ่องสอน",
  "เชียงใหม่",
  "เชียงราย",
  "ลำพูน",
  "ลำปาง",
  "พะเยา",
  "แพร่",
  "น่าน",
  "กรุงเทพมหานคร",
  "นนทบุรี",
  "ปทุมธานี",
  "สมุทรปราการ",
  "ชลบุรี",
  "นครราชสีมา",
  "ขอนแก่น",
  "ภูเก็ต",
  "สงขลา",
  "อื่นๆ (Other)",
];

export default function NewPatientPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Patient Intake Mode
  const [idType, setIdType] = useState<IdType>("THAI_ID");

  // Section 1: Identification & Basic Details
  const [fullname, setFullname] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [occupation, setOccupation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>("SINGLE");

  // Auto-calculated age
  const calculatedAge = dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : "";

  // Section 2: Nationality, Ethnicity & Religion
  const [citizenship, setCitizenship] = useState("ไทย");
  const [ethnicity, setEthnicity] = useState("ไทย");
  const [religion, setReligion] = useState("พุทธ");

  // Section 3: Health Rights & Blood Group
  const [bloodGroupAbo, setBloodGroupAbo] = useState<BloodGroupAbo>("UNKNOWN");
  const [bloodGroupRh, setBloodGroupRh] = useState<BloodGroupRh>("UNKNOWN");
  const [treatmentRights, setTreatmentRights] = useState<TreatmentRights>("PAY_DIRECT");
  const [allergyOption, setAllergyOption] = useState<"Unknown" | "No" | "Yes">("No");
  const [drugAllergyDetail, setDrugAllergyDetail] = useState("");

  // Section 4: Structured Address
  const [houseNo, setHouseNo] = useState("");
  const [moo, setMoo] = useState("");
  const [soi, setSoi] = useState("");
  const [road, setRoad] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("แม่ฮ่องสอน");
  const [zipCode, setZipCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

  // Section 5: Thai-Specific Master Data
  const [originalDomicile, setOriginalDomicile] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [education, setEducation] = useState("");
  const [householdStatus, setHouseholdStatus] = useState<HouseholdStatus | "">("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [thaiCalendarBirthDate, setThaiCalendarBirthDate] = useState("");

  // Section 6: Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<ContactPersonRequestDTO[]>([
    {
      contactName: "",
      relationship: "",
      contactAddress: "",
      mobileNumber: "",
    },
  ]);

  const handleIdTypeChange = (type: IdType) => {
    setIdType(type);
    if (type === "THAI_ID") {
      setCitizenship("ไทย");
      setEthnicity("ไทย");
      setReligion("พุทธ");
    } else {
      setCitizenship("");
      setEthnicity("");
      setReligion("");
    }
  };

  const addEmergencyContact = () => {
    setEmergencyContacts((prev) => [
      ...prev,
      { contactName: "", relationship: "", contactAddress: "", mobileNumber: "" },
    ]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEmergencyContact = (
    index: number,
    field: keyof ContactPersonRequestDTO,
    value: string
  ) => {
    setEmergencyContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  // Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // Validate ID based on Discriminator
    if (idType === "THAI_ID") {
      if (!nationalId || nationalId.trim().length !== 13) {
        setErrorMessage("เลขประจำตัวประชาชนต้องมี 13 หลักพอดี");
        return;
      }
    } else {
      if (!passportNo || passportNo.trim().length === 0 || passportNo.trim().length > 15) {
        setErrorMessage("กรุณาระบุเลขหนังสือเดินทาง (Passport No.) ความยาวไม่เกิน 15 ตัวอักษร");
        return;
      }
    }

    if (!dateOfBirth) {
      setErrorMessage("กรุณาระบุวันเดือนปีเกิด");
      return;
    }

    if (!mobileNumber || mobileNumber.trim().length === 0) {
      setErrorMessage("กรุณาระบุเบอร์โทรศัพท์มือถือ");
      return;
    }

    // Format Drug Allergy
    let drugAllergyStr = "ไม่มีประวัติแพ้ยา";
    if (allergyOption === "Unknown") drugAllergyStr = "ไม่ทราบประวัติแพ้ยา";
    else if (allergyOption === "Yes") drugAllergyStr = drugAllergyDetail || "มีประวัติแพ้ยา";

    const payload: PatientRequestDTO = {
      fullname: fullname.trim(),
      idType,
      nationalId: idType === "THAI_ID" ? nationalId.trim() : undefined,
      passportNo: idType === "PASSPORT" ? passportNo.trim() : undefined,
      gender,
      dateOfBirth: new Date(dateOfBirth).toISOString(),
      thaiCalendarBirthDate: thaiCalendarBirthDate.trim() || undefined,
      occupation: occupation.trim() || undefined,
      maritalStatus,
      citizenship: citizenship.trim() || (idType === "THAI_ID" ? "ไทย" : undefined),
      ethnicity: ethnicity.trim() || (idType === "THAI_ID" ? "ไทย" : undefined),
      religion: religion.trim() || undefined,
      bloodGroupAbo,
      bloodGroupRh,
      treatmentRights,

      // Structured Address
      houseNo: houseNo.trim() || undefined,
      moo: moo.trim() || undefined,
      soi: soi.trim() || undefined,
      road: road.trim() || undefined,
      subDistrict: subDistrict.trim() || undefined,
      district: district.trim() || undefined,
      province: province.trim() || undefined,
      zipCode: zipCode.trim() || undefined,

      // Thai-Specific
      birthPlace: idType === "THAI_ID" ? birthPlace.trim() || undefined : undefined,
      originalDomicile: idType === "THAI_ID" ? originalDomicile.trim() || undefined : undefined,
      fatherName: idType === "THAI_ID" ? fatherName.trim() || undefined : undefined,
      motherName: idType === "THAI_ID" ? motherName.trim() || undefined : undefined,
      spouseName: idType === "THAI_ID" ? spouseName.trim() || undefined : undefined,
      householdStatus: idType === "THAI_ID" && householdStatus ? householdStatus : undefined,
      education: idType === "THAI_ID" ? education.trim() || undefined : undefined,

      // Contact
      mobileNumber: mobileNumber.trim(),
      email: email.trim() || undefined,

      contactPersons: emergencyContacts.filter((c) => c.contactName.trim() !== ""),
      healthProfile: {
        drugAllergy: drugAllergyStr,
      },
    };

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const detailMsg =
          errBody?.errors && errBody.errors.length > 0
            ? errBody.errors.join(", ")
            : errBody?.message || "ไม่สามารถบันทึกข้อมูลผู้ป่วยได้";
        setErrorMessage(detailMsg);
        return;
      }

      startTransition(() => {
        router.push("/doctor/patients");
        router.refresh();
      });
    } catch {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-body text-clinic-ink">
      {/* Header Banner */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/doctor/patients"
              className="text-xs font-semibold text-clinic-ink-soft hover:text-clinic-primary flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>รายชื่อผู้ป่วย</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-clinic-primary-deep flex items-center gap-2">
            <User className="w-6 h-6 text-clinic-primary" />
            <span>ลงทะเบียนผู้ป่วยใหม่ (Patient Intake)</span>
          </h1>
          <p className="text-xs text-clinic-ink-soft">
            แบบบันทึกประวัติผู้รับบริการตามมาตรฐานคลินิกการแพทย์แผนไทย (รองรับทั้งผู้ป่วยไทยและต่างชาติ)
          </p>
        </div>

        {/* Nationality Mode Toggle */}
        <div className="flex items-center bg-clinic-bg p-1 rounded-control border border-clinic-line shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => handleIdTypeChange("THAI_ID")}
            className={`px-3.5 py-1.5 rounded-control text-xs font-semibold flex items-center gap-1.5 transition-all ${
              idType === "THAI_ID"
                ? "bg-clinic-primary text-white shadow-xs"
                : "text-clinic-ink-soft hover:text-clinic-ink"
            }`}
          >
            <span>🇹🇭 สัญชาติไทย (Thai)</span>
          </button>
          <button
            type="button"
            onClick={() => handleIdTypeChange("PASSPORT")}
            className={`px-3.5 py-1.5 rounded-control text-xs font-semibold flex items-center gap-1.5 transition-all ${
              idType === "PASSPORT"
                ? "bg-clinic-primary text-white shadow-xs"
                : "text-clinic-ink-soft hover:text-clinic-ink"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🌍 ต่างชาติ (Foreigner)</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center gap-2 shadow-2xs">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identification & Demographics */}
        <Card className="border-clinic-line shadow-xs">
          <CardHeader className="pb-3 border-b border-clinic-line bg-clinic-bg/40">
            <CardTitle className="text-sm font-bold text-clinic-primary-deep flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-clinic-primary" />
              <span>1. ข้อมูลระบุตัวตนและข้อมูลพื้นฐาน (Identification & Basic Info)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Full Name */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  ชื่อ - นามสกุล (Full Name) <span className="text-clinic-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={idType === "THAI_ID" ? "เช่น นายสมชาย การุณย์" : "e.g. John Doe"}
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              {/* ID Discriminator Field */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  {idType === "THAI_ID" ? (
                    <span>
                      เลขประจำตัวประชาชน (National ID - 13 หลัก){" "}
                      <span className="text-clinic-danger">*</span>
                    </span>
                  ) : (
                    <span>
                      เลขหนังสือเดินทาง (Passport No. - ไม่เกิน 15 ตัว){" "}
                      <span className="text-clinic-danger">*</span>
                    </span>
                  )}
                </label>
                {idType === "THAI_ID" ? (
                  <input
                    type="text"
                    required
                    maxLength={13}
                    placeholder="13 หลัก เช่น 1509900123456"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-9 px-3 text-xs font-mono bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="e.g. AA1234567"
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value.toUpperCase())}
                    className="w-full h-9 px-3 text-xs font-mono uppercase bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                )}
              </div>

              {/* Gender */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  เพศ (Gender) <span className="text-clinic-danger">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                >
                  <option value="MALE">ชาย (Male)</option>
                  <option value="FEMALE">หญิง (Female)</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  วัน/เดือน/ปีเกิด (Date of Birth) <span className="text-clinic-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              {/* Calculated Age */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">อายุ (Age)</label>
                <div className="w-full h-9 px-3 text-xs bg-clinic-bg/60 border border-clinic-line rounded-control flex items-center text-clinic-ink font-semibold">
                  {calculatedAge ? `${calculatedAge} ปี` : "-"}
                </div>
              </div>

              {/* Lunar Astrological Birth Date (For both Thai and Foreign Patients) */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  วันเดือนปีเกิดทางจันทรคติ (Lunar Date)
                </label>
                <input
                  type="text"
                  placeholder="เช่น 1ฯ 8- 12"
                  value={thaiCalendarBirthDate}
                  onChange={(e) => setThaiCalendarBirthDate(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary font-mono"
                />
              </div>

              {/* Occupation */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  อาชีพ (Occupation)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ข้าราชการ, ค้าขาย, เกษตรกร, Programmer"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              {/* Canonical Marital Status (7 Values) */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  สถานภาพสมรส (Marital Status) <span className="text-clinic-danger">*</span>
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                >
                  <option value="SINGLE">โสด (Single)</option>
                  <option value="IN_RELATIONSHIP">มีคู่ / อยู่ด้วยกัน (In a relationship)</option>
                  <option value="MARRIED">สมรส (Married)</option>
                  <option value="WIDOWED">หม้าย (Widowed)</option>
                  <option value="SEPARATED">แยกกันอยู่ (Separated)</option>
                  <option value="DIVORCED">หย่า (Divorced)</option>
                  <option value="MONK">สมณะ / นักบวช (Monk / Clergy)</option>
                </select>
              </div>

              {/* Citizenship & Ethnicity & Religion */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  สัญชาติ (Citizenship)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ไทย, French, American"
                  value={citizenship}
                  onChange={(e) => setCitizenship(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  เชื้อชาติ (Ethnicity)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ไทย, Chinese, Caucasian"
                  value={ethnicity}
                  onChange={(e) => setEthnicity(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  ศาสนา (Religion)
                </label>
                <input
                  type="text"
                  placeholder="เช่น พุทธ, คริสต์, อิสลาม, ไม่ระบุ"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Health Rights, Blood Group & Basic Health */}
        <Card className="border-clinic-line shadow-xs">
          <CardHeader className="pb-3 border-b border-clinic-line bg-clinic-bg/40">
            <CardTitle className="text-sm font-bold text-clinic-primary-deep flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-clinic-terracotta" />
              <span>2. สิทธิการรักษา กรุ๊ปเลือด และประวัติแพ้ยา (Treatment Rights & Blood Group)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Treatment Rights */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  สิทธิการรักษา (Treatment Rights)
                </label>
                <select
                  value={treatmentRights}
                  onChange={(e) => setTreatmentRights(e.target.value as TreatmentRights)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary font-medium"
                >
                  <option value="PAY_DIRECT">ชำระเงินเอง (Pay Direct / Self-pay)</option>
                  <option value="ELDERLY">สิทธิผู้สูงอายุ (Elderly)</option>
                  <option value="MONK">สิทธินักบวช / สมณะ (Monk)</option>
                  <option value="DISABLED">สิทธิผู้พิการ (Disabled)</option>
                  <option value="OTHER">สิทธิอื่นๆ (Other)</option>
                </select>
              </div>

              {/* Blood Group ABO */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  กรุ๊ปเลือด ABO
                </label>
                <select
                  value={bloodGroupAbo}
                  onChange={(e) => setBloodGroupAbo(e.target.value as BloodGroupAbo)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary font-bold text-clinic-primary"
                >
                  <option value="UNKNOWN">ไม่ระบุ (Unknown)</option>
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                  <option value="AB">Group AB</option>
                  <option value="O">Group O</option>
                </select>
              </div>

              {/* Blood Group Rh */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  ปัจจัย Rh Factor
                </label>
                <select
                  value={bloodGroupRh}
                  onChange={(e) => setBloodGroupRh(e.target.value as BloodGroupRh)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary font-medium"
                >
                  <option value="UNKNOWN">ไม่ระบุ / ไม่ทราบ (Unknown)</option>
                  <option value="POSITIVE">Rh+ (Positive)</option>
                  <option value="NEGATIVE">Rh- (Negative)</option>
                </select>
              </div>

              {/* Drug Allergy Option */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-xs font-semibold text-clinic-ink block">
                  ประวัติการแพ้ยา (Drug Allergy)
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-clinic-ink cursor-pointer">
                    <input
                      type="radio"
                      name="allergy"
                      value="No"
                      checked={allergyOption === "No"}
                      onChange={() => setAllergyOption("No")}
                      className="text-clinic-primary focus:ring-clinic-primary"
                    />
                    <span>ไม่มีประวัติแพ้ยา</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-clinic-ink cursor-pointer">
                    <input
                      type="radio"
                      name="allergy"
                      value="Yes"
                      checked={allergyOption === "Yes"}
                      onChange={() => setAllergyOption("Yes")}
                      className="text-clinic-primary focus:ring-clinic-primary"
                    />
                    <span className="text-clinic-danger font-semibold">มีประวัติแพ้ยา</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-clinic-ink cursor-pointer">
                    <input
                      type="radio"
                      name="allergy"
                      value="Unknown"
                      checked={allergyOption === "Unknown"}
                      onChange={() => setAllergyOption("Unknown")}
                      className="text-clinic-primary focus:ring-clinic-primary"
                    />
                    <span>ไม่ทราบ</span>
                  </label>
                </div>
              </div>

              {/* Drug Allergy Detail */}
              {allergyOption === "Yes" && (
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-clinic-danger block">
                    ระบุชื่อยาและอาการแพ้ (Allergy Details)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Penicillin (ผื่นคัน), Sulfa (บวมแน่นหน้าอก)"
                    value={drugAllergyDetail}
                    onChange={(e) => setDrugAllergyDetail(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-clinic-danger rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-danger"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Structured Contact Address */}
        <Card className="border-clinic-line shadow-xs">
          <CardHeader className="pb-3 border-b border-clinic-line bg-clinic-bg/40">
            <CardTitle className="text-sm font-bold text-clinic-primary-deep flex items-center gap-2">
              <MapPin className="w-4 h-4 text-clinic-primary" />
              <span>3. ที่อยู่และข้อมูลติดต่อ (Structured Address & Contact)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-semibold text-clinic-ink">
                  {idType === "THAI_ID" ? "บ้านเลขที่ (House No.)" : "ที่พัก/โรงแรม/บ้านเลขที่ (Hotel / Room / House No.)"}
                </label>
                <input
                  type="text"
                  placeholder={idType === "THAI_ID" ? "เช่น 304/5" : "e.g. Pai Village Resort / 123"}
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              {idType === "THAI_ID" && (
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-semibold text-clinic-ink">หมู่ที่ (Moo)</label>
                  <input
                    type="text"
                    placeholder="เช่น 8"
                    value={moo}
                    onChange={(e) => setMoo(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>
              )}

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-semibold text-clinic-ink">ซอย (Soi / Lane)</label>
                <input
                  type="text"
                  placeholder="เช่น ซอย 5 / Lane 2"
                  value={soi}
                  onChange={(e) => setSoi(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-semibold text-clinic-ink">ถนน (Road / Street)</label>
                <input
                  type="text"
                  placeholder="เช่น ถนนเวียงใต้ / Walking Street"
                  value={road}
                  onChange={(e) => setRoad(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-semibold text-clinic-ink">
                  ตำบล / แขวง (Sub-district) {idType === "PASSPORT" && <span className="text-clinic-ink-soft font-normal">(ไม่บังคับ)</span>}
                </label>
                <input
                  type="text"
                  placeholder="เช่น เวียงใต้"
                  value={subDistrict}
                  onChange={(e) => setSubDistrict(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-semibold text-clinic-ink">
                  {idType === "THAI_ID" ? "อำเภอ / เขต (District) *" : "อำเภอ / เมือง (District / City) *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ปาย / Pai"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-semibold text-clinic-ink">จังหวัด (Province)</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-semibold text-clinic-ink">รหัสไปรษณีย์ (Zip Code)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="เช่น 58130"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs font-mono bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              {/* Direct Contact Phone & Email */}
              <div className="md:col-span-6 space-y-1 pt-1">
                <label className="text-[11px] font-semibold text-clinic-ink flex items-center gap-1">
                  <Phone className="w-3 h-3 text-clinic-primary" />
                  <span>เบอร์โทรศัพท์มือถือ (Mobile Phone)</span>
                  <span className="text-clinic-danger">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="เช่น 081-935-8026"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-mono bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>

              <div className="md:col-span-6 space-y-1 pt-1">
                <label className="text-[11px] font-semibold text-clinic-ink">อีเมล (Email Address)</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Thai-Specific Details & Lunar Astrological Date */}
        {idType === "THAI_ID" && (
          <Card className="border-clinic-line shadow-xs">
            <CardHeader className="pb-3 border-b border-clinic-line bg-clinic-bg/40">
              <CardTitle className="text-sm font-bold text-clinic-primary-deep flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-clinic-terracotta" />
                <span>4. ข้อมูลประวัติเฉพาะผู้ป่วยไทย & โหราศาสตร์แผนไทย (Thai Master Data)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Original Domicile */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-clinic-ink block">
                    ภูมิลำเนาเดิม (Original Domicile)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น อ.ปาย จ.แม่ฮ่องสอน"
                    value={originalDomicile}
                    onChange={(e) => setOriginalDomicile(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>

                {/* Birth Place */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-clinic-ink block">
                    สถานที่เกิด (Birth Place)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น โรงพยาบาลปาย"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>

                {/* Education */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-clinic-ink block">
                    วุฒิการศึกษา (Education)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ปริญญาตรี, มัธยมศึกษาตอนปลาย"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>

                {/* Household Status */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-clinic-ink block">
                    สถานภาพในบ้าน (Household Status)
                  </label>
                  <select
                    value={householdStatus}
                    onChange={(e) => setHouseholdStatus(e.target.value as HouseholdStatus | "")}
                    className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  >
                    <option value="">-- ไม่ระบุ --</option>
                    <option value="HEAD_OF_HOUSEHOLD">เจ้าบ้าน (Head of Household)</option>
                    <option value="RESIDENT">ผู้อาศัย (Resident)</option>
                  </select>
                </div>

                {/* Parents and Spouse */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-clinic-ink block">ชื่อบิดา (Father)</label>
                  <input
                    type="text"
                    placeholder="ชื่อ-นามสกุล บิดา"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-clinic-ink block">ชื่อมารดา (Mother)</label>
                  <input
                    type="text"
                    placeholder="ชื่อ-นามสกุล มารดา"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-clinic-ink block">ชื่อคู่สมรส (Spouse)</label>
                  <input
                    type="text"
                    placeholder="ชื่อ-นามสกุล คู่สมรส"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 5: Emergency Contacts */}
        <Card className="border-clinic-line shadow-xs">
          <CardHeader className="pb-3 border-b border-clinic-line bg-clinic-bg/40 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-clinic-primary-deep flex items-center gap-2">
              <Users className="w-4 h-4 text-clinic-primary" />
              <span>5. บุคคลที่ติดต่อได้ในกรณีฉุกเฉิน (Emergency Contact Persons)</span>
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmergencyContact}
              className="h-7 text-xs bg-white"
            >
              + เพิ่มผู้ติดต่อ
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="p-3.5 rounded-control bg-clinic-bg/50 border border-clinic-line relative grid grid-cols-1 md:grid-cols-12 gap-3"
              >
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] font-semibold text-clinic-ink">
                    ชื่อ-นามสกุล ผู้ติดต่อ #{index + 1}
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นางสมศรี การุณย์"
                    value={contact.contactName}
                    onChange={(e) => updateEmergencyContact(index, "contactName", e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-semibold text-clinic-ink">ความสัมพันธ์</label>
                  <input
                    type="text"
                    placeholder="เช่น ภรรยา, มารดา, พี่น้อง"
                    value={contact.relationship}
                    onChange={(e) => updateEmergencyContact(index, "relationship", e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>

                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] font-semibold text-clinic-ink">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    placeholder="เช่น 089-123-4567"
                    value={contact.mobileNumber}
                    onChange={(e) => updateEmergencyContact(index, "mobileNumber", e.target.value)}
                    className="w-full h-8 px-2.5 text-xs font-mono bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary"
                  />
                </div>

                {emergencyContacts.length > 1 && (
                  <div className="md:col-span-1 flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(index)}
                      className="h-8 px-2 text-xs text-clinic-danger hover:bg-clinic-danger-bg rounded-control"
                      title="ลบผู้ติดต่อนี้"
                    >
                      ลบ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-clinic-line">
          <Button asChild variant="outline" size="sm" className="bg-white">
            <Link href="/doctor/patients">ยกเลิก</Link>
          </Button>
          <Button
            type="submit"
            variant="terracotta"
            size="sm"
            disabled={isPending}
            className="font-semibold shadow-sm px-6"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูลผู้ป่วย"}
          </Button>
        </div>
      </form>
    </div>
  );
}
