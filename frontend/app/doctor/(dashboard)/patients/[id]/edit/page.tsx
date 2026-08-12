"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ContactPersonRequestDTO, PatientResponseDTO } from "@/lib/types";

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
        const detailMsg = errBody?.errors && errBody.errors.length > 0
          ? errBody.errors.join(", ")
          : errBody?.message || "ไม่สามารถบันทึกแก้ไขข้อมูลผู้ป่วยได้";
        setErrorMessage(detailMsg);
        return;
      }

      startTransition(() => {
        router.push(`/doctor/patients/${patientId}`);
        router.refresh();
      });
    } catch {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-clinic-ink-soft space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-clinic-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">กำลังโหลดข้อมูลผู้ป่วย…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-body text-clinic-ink">
      {/* Header Banner */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-clinic-bg border border-clinic-line flex items-center justify-center text-clinic-primary shrink-0 shadow-xs">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-clinic-primary-deep flex items-center gap-2">
              Edit Patient Details
            </h1>
            <p className="text-xs text-clinic-ink-soft mt-0.5">
              แก้ไขข้อมูลเวชระเบียนผู้ป่วย (ID: {patientId})
            </p>
          </div>
        </div>

        <Link
          href={`/doctor/patients/${patientId}`}
          className="px-3.5 py-1.5 rounded-control text-xs font-semibold text-clinic-ink bg-clinic-bg border border-clinic-line hover:bg-white transition-colors"
        >
          Cancel
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium animate-in fade-in">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <section className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
            <div className="w-7 h-7 rounded-md bg-clinic-bg text-clinic-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
              Basic Information <span className="text-xs font-normal text-clinic-ink-soft">(ข้อมูลพื้นฐาน)</span>
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-clinic-ink mb-1">
                Full Name (ชื่อ-นามสกุล) <span className="text-clinic-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary focus:ring-2 focus:ring-clinic-primary/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-2">
                  Gender (เพศ) <span className="text-clinic-danger">*</span>
                </label>
                <div className="flex items-center gap-6 pt-1">
                  {["Male", "Female", "Other"].map((item) => (
                    <label key={item} className="inline-flex items-center gap-2 text-sm text-clinic-ink cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={item}
                        checked={gender === item}
                        onChange={(e) => setGender(e.target.value)}
                        className="accent-clinic-primary"
                      />
                      <span>{item === "Male" ? "Male" : item === "Female" ? "Female" : "Other"}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-1">
                  ID/Passport No. (เลขบัตรประชาชน/พาสปอร์ต) <span className="text-clinic-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={13}
                  placeholder="13-digit ID or Passport"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary focus:ring-2 focus:ring-clinic-primary/20 transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-1">
                  Date of Birth (วันเดือนปีเกิด) <span className="text-clinic-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary focus:ring-2 focus:ring-clinic-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-1">
                  Age (อายุ)
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="Yrs"
                  value={calculatedAge !== "" ? `${calculatedAge} ปี` : ""}
                  className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg/60 text-sm text-clinic-ink-soft cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-1">
                  Occupation (อาชีพ)
                </label>
                <input
                  type="text"
                  placeholder="Job title"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary focus:ring-2 focus:ring-clinic-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Status & History */}
        <section className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
            <div className="w-7 h-7 rounded-md bg-clinic-bg text-clinic-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
              Status & History <span className="text-xs font-normal text-clinic-ink-soft">(สถานภาพและประวัติ)</span>
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-clinic-ink mb-2">
                Marital Status (สถานภาพสมรส)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {["Single", "Married", "Divorced", "Widowed"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMarital(item)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      marital === item
                        ? "bg-clinic-primary text-white border-clinic-primary shadow-xs"
                        : "bg-clinic-bg text-clinic-ink border-clinic-line hover:border-clinic-primary"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-1">
                  Nationality (สัญชาติ)
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-1">
                  Ethnicity (เชื้อชาติ)
                </label>
                <input
                  type="text"
                  value={ethnic}
                  onChange={(e) => setEthnic(e.target.value)}
                  className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-1">
                  Religion (ศาสนา)
                </label>
                <input
                  type="text"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Health Information */}
        <section className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
            <div className="w-7 h-7 rounded-md bg-clinic-bg text-clinic-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
              Health Information <span className="text-xs font-normal text-clinic-ink-soft">(ข้อมูลสุขภาพ)</span>
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-clinic-ink mb-2">
                Blood Group (กรุ๊ปเลือด)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {["A", "B", "AB", "O"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBloodType(type)}
                    className={`w-10 h-9 rounded-control text-xs font-bold border transition-all cursor-pointer ${
                      bloodType === type
                        ? "bg-clinic-primary text-white border-clinic-primary shadow-xs"
                        : "bg-clinic-bg text-clinic-ink border-clinic-line hover:border-clinic-primary"
                    }`}
                  >
                    {type}
                  </button>
                ))}

                <div className="h-6 w-px bg-clinic-line mx-1" />

                {["Rh+", "Rh-"].map((rh) => (
                  <button
                    key={rh}
                    type="button"
                    onClick={() => setRhFactor(rh)}
                    className={`px-3 h-9 rounded-control text-xs font-bold border transition-all cursor-pointer ${
                      rhFactor === rh
                        ? "bg-clinic-primary/10 text-clinic-primary-deep border-clinic-primary shadow-xs"
                        : "bg-clinic-bg text-clinic-ink border-clinic-line hover:border-clinic-primary"
                    }`}
                  >
                    {rh}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-clinic-ink mb-2">
                Drug Allergy (แพ้ยา)
              </label>
              <div className="flex flex-wrap items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-clinic-ink cursor-pointer">
                  <input
                    type="radio"
                    name="allergy"
                    checked={allergyOption === "Unknown"}
                    onChange={() => setAllergyOption("Unknown")}
                    className="accent-clinic-primary"
                  />
                  <span>Unknown (ไม่ทราบ)</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-clinic-ink cursor-pointer">
                  <input
                    type="radio"
                    name="allergy"
                    checked={allergyOption === "No"}
                    onChange={() => setAllergyOption("No")}
                    className="accent-clinic-primary"
                  />
                  <span>No (ไม่มี)</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-clinic-ink cursor-pointer">
                  <input
                    type="radio"
                    name="allergy"
                    checked={allergyOption === "Yes"}
                    onChange={() => setAllergyOption("Yes")}
                    className="accent-clinic-primary"
                  />
                  <span>Yes (มี)</span>
                </label>

                {allergyOption === "Yes" && (
                  <input
                    type="text"
                    required
                    placeholder="Specify drug allergy (ระบุชื่อยาที่แพ้)"
                    value={drugAllergyDetail}
                    onChange={(e) => setDrugAllergyDetail(e.target.value)}
                    className="flex-1 min-w-[240px] px-3.5 py-1.5 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all animate-in fade-in"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Contact Address */}
        <section className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-clinic-line pb-3">
            <div className="w-7 h-7 rounded-md bg-clinic-bg text-clinic-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
              Contact Address <span className="text-xs font-normal text-clinic-ink-soft">(ที่อยู่อาศัยตามสำเนา)</span>
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-clinic-ink mb-1">
                Full Address (ที่อยู่เต็ม)
              </label>
              <textarea
                rows={2}
                placeholder="Address line"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-1">
                  Mobile (เบอร์โทรศัพท์) <span className="text-clinic-danger">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08X-XXX-XXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-clinic-ink mb-1">
                  Email (อีเมล)
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Emergency Contact */}
        <section className="bg-clinic-primary/5 border border-clinic-primary/20 rounded-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-clinic-primary/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-clinic-danger-bg text-clinic-danger flex items-center justify-center font-bold text-sm">
                ✱
              </div>
              <h2 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
                Emergency Contact <span className="text-xs font-normal text-clinic-ink-soft">(ผู้ติดต่อกรณีฉุกเฉิน)</span>
              </h2>
            </div>

            <button
              type="button"
              onClick={addEmergencyContact}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-clinic-primary text-clinic-primary hover:bg-clinic-primary hover:text-white rounded-control text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              + Add Contact
            </button>
          </div>

          <div className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="bg-white border border-clinic-line rounded-control p-4 shadow-xs relative space-y-3"
              >
                {emergencyContacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmergencyContact(index)}
                    className="absolute top-3 right-3 text-clinic-ink-soft hover:text-clinic-danger text-sm p-1 rounded-md transition-colors"
                    title="Remove Contact"
                  >
                    ✕
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-clinic-ink mb-1">
                      Name (ชื่อ-นามสกุล)
                    </label>
                    <input
                      type="text"
                      placeholder="Contact person name"
                      value={contact.contactName}
                      onChange={(e) =>
                        updateEmergencyContact(index, "contactName", e.target.value)
                      }
                      className="w-full px-3 py-1.5 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-clinic-ink mb-1">
                      Relationship (ความสัมพันธ์)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse, Parent"
                      value={contact.relationship || ""}
                      onChange={(e) =>
                        updateEmergencyContact(index, "relationship", e.target.value)
                      }
                      className="w-full px-3 py-1.5 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-clinic-ink mb-1">
                      Address (ที่อยู่)
                    </label>
                    <input
                      type="text"
                      placeholder="Contact address"
                      value={contact.contactAddress || ""}
                      onChange={(e) =>
                        updateEmergencyContact(index, "contactAddress", e.target.value)
                      }
                      className="w-full px-3 py-1.5 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-clinic-ink mb-1">
                      Telephone (เบอร์โทรศัพท์)
                    </label>
                    <input
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      value={contact.mobileNumber || ""}
                      onChange={(e) =>
                        updateEmergencyContact(index, "mobileNumber", e.target.value)
                      }
                      className="w-full px-3 py-1.5 border border-clinic-line rounded-control bg-clinic-bg text-sm text-clinic-ink focus:outline-none focus:border-clinic-primary transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/doctor/patients/${patientId}`}
            className="px-6 py-2.5 rounded-control text-sm font-semibold text-clinic-ink bg-white border border-clinic-line hover:bg-clinic-bg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-control text-sm font-semibold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {isPending ? "Updating Record…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
