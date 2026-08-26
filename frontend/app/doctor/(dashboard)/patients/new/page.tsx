"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ContactPersonRequestDTO } from "@/lib/types";
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
  Heart,
  MapPin,
  Phone,
  ShieldAlert,
  Plus,
  Trash2,
} from "lucide-react";

const PROVINCES = [
  "กรุงเทพมหานคร",
  "เชียงใหม่",
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

  // Section 1: Basic Information
  const [fullname, setFullname] = useState("");
  const [gender, setGender] = useState("Male");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [occupation, setOccupation] = useState("");

  // Auto-calculated age
  const calculatedAge = dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : "";

  // Section 2: Status & History
  const [marital, setMarital] = useState("Single");
  const [nationality, setNationality] = useState("Thai");
  const [ethnic, setEthnic] = useState("Thai");
  const [religion, setReligion] = useState("Buddhism");

  // Section 3: Health Information
  const [bloodType, setBloodType] = useState("A");
  const [rhFactor, setRhFactor] = useState("Rh+");
  const [allergyOption, setAllergyOption] = useState<"Unknown" | "No" | "Yes">("No");
  const [drugAllergyDetail, setDrugAllergyDetail] = useState("");

  // Section 4: Contact Address Breakdown
  const [houseNo, setHouseNo] = useState("");
  const [soi, setSoi] = useState("");
  const [road, setRoad] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("กรุงเทพมหานคร");
  const [zipCode, setZipCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

  // Section 5: Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<
    ContactPersonRequestDTO[]
  >([
    {
      contactName: "",
      relationship: "",
      contactAddress: "",
      mobileNumber: "",
    },
  ]);

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

    // Validate ID Number
    if (!idNumber || idNumber.length !== 13) {
      setErrorMessage("เลขบัตรประชาชน/พาสปอร์ต ต้องมี 13 หลัก (ID Number must be 13 digits)");
      return;
    }

    // Build unified address
    const addressParts = [
      houseNo ? `บ้านเลขที่ ${houseNo}` : "",
      soi ? `ซอย ${soi}` : "",
      road ? `ถนน ${road}` : "",
      subDistrict ? `แขวง/ตำบล ${subDistrict}` : "",
      district ? `เขต/อำเภอ ${district}` : "",
      province,
      zipCode,
    ].filter(Boolean);

    const fullAddress = addressParts.join(" ");

    // Format Date of Birth Thai
    const dobObj = dateOfBirth ? new Date(dateOfBirth) : new Date();
    const dobThaiStr = `${dobObj.getDate()}/${dobObj.getMonth() + 1}/${dobObj.getFullYear() + 543}`;

    // Format Drug Allergy
    let drugAllergyStr = "ไม่มีประวัติแพ้ยา";
    if (allergyOption === "Unknown") drugAllergyStr = "ไม่ทราบประวัติแพ้ยา";
    else if (allergyOption === "Yes") drugAllergyStr = drugAllergyDetail || "มีประวัติแพ้ยา";

    const payload = {
      fullname,
      gender,
      idNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : new Date().toISOString(),
      dateOfBirthThai: dobThaiStr,
      occupation: occupation || "ค้าขาย/รับจ้าง",
      marital,
      nationality,
      ethnic,
      religion,
      bloodGroup: `${bloodType}${rhFactor === "Rh+" ? "+" : "-"}`,
      address: fullAddress,
      mobileNumber,
      email: email || undefined,
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
        throw new Error(errBody?.message || "ไม่สามารถบันทึกข้อมูลผู้ป่วยได้");
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
          <Button asChild variant="outline" size="sm">
            <Link href="/doctor/patients">
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </Link>
          </Button>
        }
      />

      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Info */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-clinic-primary" />
              <span>1. ข้อมูลทั่วไป (Basic Information)</span>
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
                placeholder="เช่น นาย สมชาย ใจดี"
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
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Male">ชาย (Male)</option>
                <option value="Female">หญิง (Female)</option>
                <option value="Other">อื่นๆ (Other)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idNumber" required>
                เลขบัตรประชาชน 13 หลัก (ID Number)
              </Label>
              <Input
                id="idNumber"
                required
                maxLength={13}
                placeholder="1234567890123"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ""))}
              />
            </div>

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
                className="bg-clinic-bg"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <Label htmlFor="occupation">อาชีพ (Occupation)</Label>
              <Input
                id="occupation"
                placeholder="เช่น ข้าราชการ, พนักงานบริษัท, ค้าขาย"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Status & Origin */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-clinic-primary" />
              <span>2. สถานภาพและสัญชาติ (Status & Background)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="marital">สถานภาพสมรส</Label>
              <Select
                id="marital"
                value={marital}
                onChange={(e) => setMarital(e.target.value)}
              >
                <option value="Single">โสด (Single)</option>
                <option value="Married">สมรส (Married)</option>
                <option value="Divorced">หย่าร้าง (Divorced)</option>
                <option value="Widowed">หม้าย (Widowed)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nationality">สัญชาติ</Label>
              <Input
                id="nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ethnic">เชื้อชาติ</Label>
              <Input
                id="ethnic"
                value={ethnic}
                onChange={(e) => setEthnic(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="religion">ศาสนา</Label>
              <Input
                id="religion"
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Health & Allergy */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-clinic-terracotta" />
              <span>3. ข้อมูลสุขภาพและการแพ้ยา (Health & Allergies)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bloodType" required>
                  กรุ๊ปเลือด (ABO)
                </Label>
                <Select
                  id="bloodType"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rhFactor">Rh Factor</Label>
                <Select
                  id="rhFactor"
                  value={rhFactor}
                  onChange={(e) => setRhFactor(e.target.value)}
                >
                  <option value="Rh+">Rh+ (Positive)</option>
                  <option value="Rh-">Rh- (Negative)</option>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="allergyOption" required>
                  ประวัติการแพ้ยา (Drug Allergy)
                </Label>
                <Select
                  id="allergyOption"
                  value={allergyOption}
                  onChange={(e) => setAllergyOption(e.target.value as any)}
                >
                  <option value="No">ไม่มีประวัติแพ้ยา (No known allergy)</option>
                  <option value="Yes">มีประวัติแพ้ยา (Has allergy)</option>
                  <option value="Unknown">ไม่ทราบประวัติ (Unknown)</option>
                </Select>
              </div>
            </div>

            {allergyOption === "Yes" && (
              <div className="p-3.5 bg-clinic-danger-bg border border-clinic-danger/40 rounded-control space-y-1.5">
                <Label htmlFor="drugAllergyDetail" className="text-clinic-danger font-semibold">
                  ระบุชื่อยาหรือกลุ่มยาที่แพ้ *
                </Label>
                <Input
                  id="drugAllergyDetail"
                  required
                  placeholder="เช่น Penicillin, Sulfa, แอสไพริน"
                  value={drugAllergyDetail}
                  onChange={(e) => setDrugAllergyDetail(e.target.value)}
                  className="bg-white border-clinic-danger/50"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Address & Contacts */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-clinic-primary" />
              <span>4. ข้อมูลที่อยู่และการติดต่อ (Contact Address)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                <Label htmlFor="soi">ซอย</Label>
                <Input
                  id="soi"
                  placeholder="เช่น สุขุมวิท 10"
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

              <div className="space-y-1.5">
                <Label htmlFor="subDistrict">แขวง / ตำบล</Label>
                <Input
                  id="subDistrict"
                  value={subDistrict}
                  onChange={(e) => setSubDistrict(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district">เขต / อำเภอ</Label>
                <Input
                  id="district"
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
                  maxLength={5}
                  placeholder="10110"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobileNumber" required>
                  เบอร์โทรศัพท์ (Mobile Number)
                </Label>
                <Input
                  id="mobileNumber"
                  required
                  placeholder="0812345678"
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

        {/* 5. Emergency Contacts */}
        <Card>
          <CardHeader className="pb-3 border-b border-clinic-line flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-clinic-terracotta" />
              <span>5. ผู้ติดต่อกรณีฉุกเฉิน (Emergency Contacts)</span>
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
                className="p-4 bg-clinic-bg/50 border border-clinic-line rounded-control grid grid-cols-1 sm:grid-cols-3 gap-3 relative"
              >
                <div className="space-y-1.5">
                  <Label>ชื่อผู้ติดต่อ</Label>
                  <Input
                    placeholder="เช่น นาง สมศรี (มารดา)"
                    value={contact.contactName}
                    onChange={(e) =>
                      updateEmergencyContact(index, "contactName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>ความสัมพันธ์</Label>
                  <Input
                    placeholder="เช่น มารดา, สามี, ญาติ"
                    value={contact.relationship || ""}
                    onChange={(e) =>
                      updateEmergencyContact(index, "relationship", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>เบอร์โทรศัพท์</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="089xxxxxxx"
                      value={contact.mobileNumber || ""}
                      onChange={(e) =>
                        updateEmergencyContact(index, "mobileNumber", e.target.value)
                      }
                    />
                    {emergencyContacts.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="icon"
                        onClick={() => removeEmergencyContact(index)}
                        className="shrink-0 h-10 w-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="outline" size="lg">
            <Link href="/doctor/patients">ยกเลิก</Link>
          </Button>
          <Button
            type="submit"
            variant="terracotta"
            size="lg"
            disabled={isPending}
            className="min-w-[140px]"
          >
            {isPending ? "กำลังบันทึก..." : "✓ บันทึกข้อมูลผู้ป่วย"}
          </Button>
        </div>
      </form>
    </div>
  );
}
