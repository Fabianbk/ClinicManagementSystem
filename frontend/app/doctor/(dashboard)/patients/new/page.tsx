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
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  UserPlus,
  ArrowLeft,
  User,
  CreditCard,
  HeartPulse,
  MapPin,
  Users,
  Phone,
  Globe,
  Sparkles,
  ShieldAlert,
  Plus,
  Trash2,
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
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  }

  return (
    <div className="space-y-6 pb-20 font-body text-clinic-ink">
      <PageHeader
        icon={<UserPlus className="w-5 h-5 text-clinic-primary" />}
        title="ลงทะเบียนผู้รับบริการใหม่ (New Patient)"
        subtitle="กรอกข้อมูลประวัติเวชระเบียนผู้ป่วยใหม่ บันทึกข้อมูลสุขภาพ และประวัติการแพ้ยา"
        actions={
          <div className="flex items-center gap-3">
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

            <Button asChild variant="outline" size="sm">
              <Link href="/doctor/patients">
                <ArrowLeft className="w-4 h-4" />
                <span>ย้อนกลับ</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center gap-2 shadow-2xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Info & Identification */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-clinic-primary" />
              <span>1. ข้อมูลระบุตัวตน & ข้อมูลทั่วไป (Basic Info & Identification)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="fullname" required>
                ชื่อ-นามสกุล (Full Name)
              </Label>
              <Input
                id="fullname"
                required
                placeholder={idType === "THAI_ID" ? "เช่น นาย สมชาย ใจดี" : "e.g. John Doe"}
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender" required>
                เพศ (Gender)
              </Label>
              <Select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="MALE">ชาย (Male)</option>
                <option value="FEMALE">หญิง (Female)</option>
                <option value="OTHER">อื่นๆ (Other)</option>
              </Select>
            </div>

            {idType === "THAI_ID" ? (
              <div className="space-y-1.5">
                <Label htmlFor="nationalId" required>
                  เลขประจำตัวประชาชน 13 หลัก (National ID)
                </Label>
                <Input
                  id="nationalId"
                  required
                  maxLength={13}
                  placeholder="1234567890123"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="passportNo" required>
                  เลขหนังสือเดินทาง (Passport No.)
                </Label>
                <Input
                  id="passportNo"
                  required
                  maxLength={15}
                  placeholder="e.g. AA1234567"
                  value={passportNo}
                  onChange={(e) => setPassportNo(e.target.value.toUpperCase())}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" required>
                วันเดือนปีเกิด (Date of Birth)
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="calculatedAge">อายุคำนวณ (ปี)</Label>
              <Input
                id="calculatedAge"
                readOnly
                disabled
                value={calculatedAge !== "" ? `${calculatedAge} ปี` : "-"}
                className="bg-clinic-bg font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maritalStatus">สถานภาพสมรส (Marital Status)</Label>
              <Select
                id="maritalStatus"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
              >
                <option value="SINGLE">โสด (Single)</option>
                <option value="IN_RELATIONSHIP">มีคู่ / อยู่ด้วยกัน (In a relationship)</option>
                <option value="MARRIED">สมรส (Married)</option>
                <option value="WIDOWED">หม้าย (Widowed)</option>
                <option value="SEPARATED">แยกกันอยู่ (Separated)</option>
                <option value="DIVORCED">หย่า (Divorced)</option>
                <option value="MONK">สมณะ / นักบวช (Monk / Clergy)</option>
              </Select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="occupation">อาชีพ (Occupation)</Label>
              <Input
                id="occupation"
                placeholder="เช่น ข้าราชการ, ค้าขาย, เกษตรกร"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Nationality, Ethnicity & Religion */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-clinic-primary" />
              <span>2. สัญชาติ เชื้อชาติ และศาสนา (Citizenship, Ethnicity & Religion)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="citizenship">สัญชาติ (Citizenship)</Label>
              <Input
                id="citizenship"
                placeholder="เช่น ไทย, เมียนมา, จีน"
                value={citizenship}
                onChange={(e) => setCitizenship(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ethnicity">เชื้อชาติ (Ethnicity)</Label>
              <Input
                id="ethnicity"
                placeholder="เช่น ไทย, ไทใหญ่, ปกาเกอะญอ"
                value={ethnicity}
                onChange={(e) => setEthnicity(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="religion">ศาสนา (Religion)</Label>
              <Input
                id="religion"
                placeholder="เช่น พุทธ, คริสต์, อิสลาม"
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Blood Group & Treatment Rights */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-clinic-terracotta" />
              <span>3. กรุ๊ปเลือด & สิทธิการรักษา (Blood Group & Rights)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bloodGroupAbo">กรุ๊ปเลือด ABO</Label>
              <Select
                id="bloodGroupAbo"
                value={bloodGroupAbo}
                onChange={(e) => setBloodGroupAbo(e.target.value as BloodGroupAbo)}
              >
                <option value="UNKNOWN">ไม่ระบุ / ไม่ทราบ (Unknown)</option>
                <option value="A">กลุ่ม A</option>
                <option value="B">กลุ่ม B</option>
                <option value="AB">กลุ่ม AB</option>
                <option value="O">กลุ่ม O</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bloodGroupRh">หมู่เลือด Rh</Label>
              <Select
                id="bloodGroupRh"
                value={bloodGroupRh}
                onChange={(e) => setBloodGroupRh(e.target.value as BloodGroupRh)}
              >
                <option value="UNKNOWN">ไม่ระบุ (Unknown)</option>
                <option value="POSITIVE">Rh+ (Positive)</option>
                <option value="NEGATIVE">Rh- (Negative)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="treatmentRights">สิทธิการรักษา (Treatment Rights)</Label>
              <Select
                id="treatmentRights"
                value={treatmentRights}
                onChange={(e) => setTreatmentRights(e.target.value as TreatmentRights)}
              >
                <option value="PAY_DIRECT">ชำระเงินเอง (Self-pay)</option>
                <option value="ELDERLY">สิทธิผู้สูงอายุ (Elderly)</option>
                <option value="MONK">สิทธินักบวช / พระสงฆ์ (Monk)</option>
                <option value="DISABLED">สิทธิผู้พิการ (Disabled)</option>
                <option value="OTHER">สิทธิอื่นๆ (Other)</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 4. Structured Address & Contact */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-clinic-primary" />
              <span>4. ที่อยู่อาศัย & ข้อมูลติดต่อ (Address & Contact Info)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="houseNo">บ้านเลขที่</Label>
                <Input
                  id="houseNo"
                  placeholder="เช่น 123/45"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="moo">หมู่ที่</Label>
                <Input
                  id="moo"
                  placeholder="เช่น 3"
                  value={moo}
                  onChange={(e) => setMoo(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="soi">ซอย</Label>
                <Input
                  id="soi"
                  placeholder="เช่น ซอย 5"
                  value={soi}
                  onChange={(e) => setSoi(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="road">ถนน</Label>
                <Input
                  id="road"
                  placeholder="เช่น สุขุมวิท"
                  value={road}
                  onChange={(e) => setRoad(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="subDistrict">ตำบล / แขวง</Label>
                <Input
                  id="subDistrict"
                  placeholder="เช่น เวียงใต้"
                  value={subDistrict}
                  onChange={(e) => setSubDistrict(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district">อำเภอ / เขต</Label>
                <Input
                  id="district"
                  placeholder="เช่น ปาย"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="province">จังหวัด</Label>
                <Select
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="zipCode">รหัสไปรษณีย์</Label>
                <Input
                  id="zipCode"
                  maxLength={10}
                  placeholder="58130"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-clinic-line">
              <div className="space-y-1.5">
                <Label htmlFor="mobileNumber" required>
                  เบอร์โทรศัพท์มือถือ (Mobile Phone)
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  required
                  placeholder="เช่น 081-935-8026"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">อีเมล (Email)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Thai-Specific Master Data */}
        {idType === "THAI_ID" && (
          <Card>
            <CardHeader className="pb-3 border-b border-clinic-line">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-clinic-terracotta" />
                <span>5. ข้อมูลประวัติเฉพาะผู้ป่วยไทย & โหราศาสตร์แผนไทย (Thai Master Data)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="originalDomicile">ภูมิลำเนาเดิม</Label>
                  <Input
                    id="originalDomicile"
                    placeholder="เช่น อ.ปาย จ.แม่ฮ่องสอน"
                    value={originalDomicile}
                    onChange={(e) => setOriginalDomicile(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="birthPlace">สถานที่เกิด</Label>
                  <Input
                    id="birthPlace"
                    placeholder="เช่น รพ.ปาย"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="education">วุฒิการศึกษา</Label>
                  <Input
                    id="education"
                    placeholder="เช่น ปริญญาตรี"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="householdStatus">สถานภาพในบ้าน</Label>
                  <Select
                    id="householdStatus"
                    value={householdStatus}
                    onChange={(e) => setHouseholdStatus(e.target.value as HouseholdStatus | "")}
                  >
                    <option value="">-- ไม่ระบุ --</option>
                    <option value="HEAD_OF_HOUSEHOLD">เจ้าบ้าน (Head of Household)</option>
                    <option value="RESIDENT">ผู้อาศัย (Resident)</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fatherName">ชื่อบิดา</Label>
                  <Input
                    id="fatherName"
                    placeholder="ชื่อ-นามสกุล บิดา"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="motherName">ชื่อมารดา</Label>
                  <Input
                    id="motherName"
                    placeholder="ชื่อ-นามสกุล มารดา"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="spouseName">ชื่อคู่สมรส</Label>
                  <Input
                    id="spouseName"
                    placeholder="ชื่อ-นามสกุล คู่สมรส"
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="thaiCalendarBirthDate">
                    วันเดือนปีเกิดทางจันทรคติ (เช่น 1ฯ 8- 12)
                  </Label>
                  <Input
                    id="thaiCalendarBirthDate"
                    placeholder="เช่น 1ฯ 8- 12"
                    value={thaiCalendarBirthDate}
                    onChange={(e) => setThaiCalendarBirthDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. Emergency Contacts */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-clinic-primary" />
              <span>6. บุคคลที่ติดต่อได้ในกรณีฉุกเฉิน (Emergency Contacts)</span>
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmergencyContact}
              className="h-7 text-xs gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มผู้ติดต่อ</span>
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="p-4 bg-clinic-bg/50 border border-clinic-line rounded-control grid grid-cols-1 sm:grid-cols-4 gap-3 relative"
              >
                <div className="space-y-1.5">
                  <Label>ชื่อผู้ติดต่อ</Label>
                  <Input
                    placeholder="เช่น นาง สมศรี"
                    value={contact.contactName}
                    onChange={(e) =>
                      updateEmergencyContact(index, "contactName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>ความสัมพันธ์</Label>
                  <Input
                    placeholder="เช่น มารดา, สามี"
                    value={contact.relationship || ""}
                    onChange={(e) =>
                      updateEmergencyContact(index, "relationship", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>เบอร์โทรศัพท์</Label>
                  <Input
                    placeholder="089xxxxxxx"
                    value={contact.mobileNumber || ""}
                    onChange={(e) =>
                      updateEmergencyContact(index, "mobileNumber", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5 flex items-end gap-2">
                  <div className="flex-1">
                    <Label>ที่อยู่ผู้ติดต่อ</Label>
                    <Input
                      placeholder="ที่อยู่ (ถ้ามี)"
                      value={contact.contactAddress || ""}
                      onChange={(e) =>
                        updateEmergencyContact(index, "contactAddress", e.target.value)
                      }
                    />
                  </div>
                  {emergencyContacts.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="icon"
                      onClick={() => removeEmergencyContact(index)}
                      className="shrink-0 h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-clinic-line">
          <Button asChild variant="outline" size="sm">
            <Link href="/doctor/patients">ยกเลิก</Link>
          </Button>
          <Button
            type="submit"
            variant="terracotta"
            size="sm"
            disabled={isPending}
            className="font-semibold shadow-sm px-6"
          >
            {isPending ? "กำลังบันทึก..." : "✓ บันทึกข้อมูลผู้ป่วย"}
          </Button>
        </div>
      </form>
    </div>
  );
}
