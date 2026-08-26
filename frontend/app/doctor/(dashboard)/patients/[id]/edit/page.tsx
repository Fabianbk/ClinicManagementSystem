"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ContactPersonRequestDTO, PatientResponseDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Edit,
  ArrowLeft,
  User,
  Heart,
  MapPin,
  Phone,
  ShieldAlert,
  Plus,
  Trash2,
} from "lucide-react";

export default function EditPatientPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const patientId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Section 1: Basic Information
  const [fullname, setFullname] = useState("");
  const [gender, setGender] = useState("Male");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [occupation, setOccupation] = useState("");

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

  // Section 4: Contact Address
  const [fullAddress, setFullAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

  // Section 5: Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<ContactPersonRequestDTO[]>([]);

  // Fetch patient data on mount
  useEffect(() => {
    async function loadPatient() {
      try {
        const res = await fetch(`/api/patients/${patientId}`);
        if (!res.ok) {
          setErrorMessage("ไม่สามารถโหลดข้อมูลผู้ป่วยได้");
          setIsLoading(false);
          return;
        }
        const data: PatientResponseDTO = await res.json();

        setFullname(data.fullname || "");
        setGender(data.gender || "Male");
        setIdNumber(data.idNumber || "");

        if (data.dateOfBirth) {
          const dobDate = new Date(data.dateOfBirth);
          if (!isNaN(dobDate.getTime())) {
            setDateOfBirth(dobDate.toISOString().split("T")[0]);
          }
        }

        setOccupation(data.occupation || "");
        setMarital(data.marital || "Single");
        setNationality(data.nationality || "Thai");
        setEthnic(data.ethnic || "Thai");
        setReligion(data.religion || "Buddhism");

        // Parse blood group
        if (data.bloodGroup) {
          const bg = data.bloodGroup.trim();
          if (bg.includes("-")) {
            setRhFactor("Rh-");
            setBloodType(bg.replace("-", "").trim());
          } else {
            setRhFactor("Rh+");
            setBloodType(bg.replace("+", "").trim());
          }
        }

        // Parse drug allergy
        const allergyStr = data.healthProfile?.drugAllergy || "";
        if (allergyStr.includes("ไม่ทราบ")) {
          setAllergyOption("Unknown");
        } else if (allergyStr.includes("ไม่มี") || allergyStr === "") {
          setAllergyOption("No");
        } else {
          setAllergyOption("Yes");
          setDrugAllergyDetail(allergyStr);
        }

        setFullAddress(data.address || "");
        setMobileNumber(data.mobileNumber || "");
        setEmail(data.email || "");

        if (data.contactPersons && data.contactPersons.length > 0) {
          setEmergencyContacts(
            data.contactPersons.map((c) => ({
              contactName: c.contactName,
              relationship: c.relationship || "",
              contactAddress: c.contactAddress || "",
              mobileNumber: c.mobileNumber || "",
            }))
          );
        } else {
          setEmergencyContacts([
            { contactName: "", relationship: "", contactAddress: "", mobileNumber: "" },
          ]);
        }

        setIsLoading(false);
      } catch {
        setErrorMessage("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setIsLoading(false);
      }
    }

    loadPatient();
  }, [patientId]);

  // Age calculation
  const calculatedAge = dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : "";

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

    if (!idNumber || idNumber.length !== 13) {
      setErrorMessage("เลขบัตรประชาชน/พาสปอร์ต ต้องมี 13 หลัก");
      return;
    }

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
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message || "ไม่สามารถบันทึกการแก้ไขข้อมูลได้");
      }

      startTransition(() => {
        router.push(`/doctor/patients/${patientId}`);
        router.refresh();
      });
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center text-clinic-ink-soft space-y-2">
        <div className="w-8 h-8 border-2 border-clinic-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-medium">กำลังโหลดข้อมูลผู้ป่วย...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-body text-clinic-ink">
      <PageHeader
        icon={<Edit className="w-5 h-5 text-clinic-primary" />}
        title={`แก้ไขข้อมูลผู้ป่วย: ${fullname}`}
        subtitle={`HN: P-${String(patientId).padStart(5, "0")} · ปรับปรุงข้อมูลทั่วไป ข้อมูลติดต่อ และประวัติการแพ้ยา`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/doctor/patients/${patientId}`}>
              <ArrowLeft className="w-4 h-4" />
              <span>ยกเลิก / ย้อนกลับ</span>
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
                เลขบัตรประชาชน 13 หลัก
              </Label>
              <Input
                id="idNumber"
                required
                maxLength={13}
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" required>
                วันเดือนปีเกิด
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
              <span>4. ข้อมูลที่อยู่และการติดต่อ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullAddress">ที่อยู่ตามสำเนา (Full Address)</Label>
              <Input
                id="fullAddress"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="mobileNumber" required>
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="mobileNumber"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
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
                    value={contact.contactName}
                    onChange={(e) =>
                      updateEmergencyContact(index, "contactName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>ความสัมพันธ์</Label>
                  <Input
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
            <Link href={`/doctor/patients/${patientId}`}>ยกเลิก</Link>
          </Button>
          <Button
            type="submit"
            variant="terracotta"
            size="lg"
            disabled={isPending}
            className="min-w-[140px]"
          >
            {isPending ? "กำลังบันทึก..." : "✓ บันทึกการแก้ไข"}
          </Button>
        </div>
      </form>
    </div>
  );
}
