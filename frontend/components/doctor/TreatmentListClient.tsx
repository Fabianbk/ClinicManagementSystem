"use client";

import { useState } from "react";
import Link from "next/link";
import type { RecordTreatmentResponseDTO, PageResponse } from "@/lib/types";

interface TreatmentListClientProps {
  doctorId: number;
  doctorName?: string;
  initialData: PageResponse<RecordTreatmentResponseDTO> | null;
}

function formatDateThai(dateInput: string | Date | undefined): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TreatmentListClient({
  doctorId,
  doctorName,
  initialData,
}: TreatmentListClientProps) {
  const [treatments, setTreatments] = useState<RecordTreatmentResponseDTO[]>(
    initialData?.content ?? []
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reload treatments
  const refreshTreatments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/record-treatments?page=0&size=100`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดรายการบันทึกการรักษาได้");
      const data: PageResponse<RecordTreatmentResponseDTO> = await res.json();
      setTreatments(data.content ?? []);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Filter treatments
  const filteredTreatments = treatments.filter((item) => {
    // Date filter
    if (selectedDate !== "") {
      const itemDateStr = item.recordDate
        ? new Date(item.recordDate).toISOString().split("T")[0]
        : "";
      if (itemDateStr !== selectedDate) return false;
    }

    // Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchPatient = item.patientFullname?.toLowerCase().includes(q);
      const matchDoctor = item.doctorFullname?.toLowerCase().includes(q);
      const matchSymptoms = item.symptoms?.toLowerCase().includes(q);
      const matchTtm = item.ttmDiagnosis?.toLowerCase().includes(q);
      const matchId =
        item.recordTreatmentId?.toString().includes(q) ||
        item.patientId?.toString().includes(q);
      if (!matchPatient && !matchDoctor && !matchSymptoms && !matchTtm && !matchId) {
        return false;
      }
    }

    return true;
  });

  // Calculate KPIs
  const totalCount = treatments.length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = treatments.filter((t) => {
    const tDate = t.recordDate ? new Date(t.recordDate).toISOString().split("T")[0] : "";
    return tDate === todayStr;
  }).length;

  const totalMedicinesDispensed = treatments.reduce(
    (sum, t) => sum + (t.recordTreatmentMedicines?.length || 0),
    0
  );

  const totalRevenue = treatments.reduce((sum, t) => {
    return sum + (t.receipt?.totalPrice || 0);
  }, 0);

  return (
    <div className="space-y-6 font-body text-clinic-ink">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-clinic-primary-deep flex items-center gap-2">
            <span>🌿 ประวัติและการบันทึกการตรวจรักษา</span>
          </h1>
          <p className="text-sm text-clinic-ink-soft mt-1">
            จัดการเวชระเบียนการรักษาแพทย์แผนไทย บันทึกอาการ ตรวจร่างกาย จ่ายยา และออกใบสั่งการรักษา
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refreshTreatments}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-control text-xs font-semibold text-clinic-ink bg-white border border-clinic-line hover:bg-clinic-bg transition-all shadow-2xs cursor-pointer"
          >
            🔄 รีเฟรช
          </button>
          <Link
            href="/doctor/treatments/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-control text-sm font-bold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>+ บันทึกการรักษาใหม่</span>
          </Link>
        </div>
      </div>

      {/* Alert message */}
      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline ml-2 cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            บันทึกการรักษาทั้งหมด
          </span>
          <div className="text-3xl font-bold text-clinic-primary-deep font-display">
            {totalCount} <span className="text-xs font-normal text-clinic-ink-soft">เคส</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            ตรวจรักษาในวันนี้
          </span>
          <div className="text-3xl font-bold text-emerald-600 font-display">
            {todayCount} <span className="text-xs font-normal text-clinic-ink-soft">เคส</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            รายการยาที่สั่งจ่าย
          </span>
          <div className="text-3xl font-bold text-blue-600 font-display">
            {totalMedicinesDispensed} <span className="text-xs font-normal text-clinic-ink-soft">รายการ</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            ยอดรวมค่ารักษาและยา
          </span>
          <div className="text-3xl font-bold text-clinic-accent-deep font-display">
            ฿{totalRevenue.toLocaleString()}{" "}
            <span className="text-xs font-normal text-clinic-ink-soft">บาท</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-card border border-clinic-line shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-clinic-ink-soft text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ป่วย, อาการ, การวินิจฉัย, หรือรหัสเวชระเบียน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-clinic-line rounded-control text-sm text-clinic-ink focus:outline-hidden focus:ring-2 focus:ring-clinic-primary bg-clinic-bg/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-clinic-ink-soft whitespace-nowrap">
            กรองตามวันที่:
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40 focus:ring-2 focus:ring-clinic-primary"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="text-xs text-clinic-danger hover:underline cursor-pointer"
            >
              ล้าง
            </button>
          )}
        </div>
      </div>

      {/* Treatments List Table */}
      {loading ? (
        <div className="p-16 text-center text-clinic-ink-soft text-sm animate-pulse">
          กำลังโหลดประวัติการรักษา…
        </div>
      ) : filteredTreatments.length === 0 ? (
        <div className="border border-dashed border-clinic-line rounded-card p-16 text-center text-clinic-ink-soft bg-white space-y-3">
          <div className="w-12 h-12 rounded-full bg-clinic-bg border border-clinic-line mx-auto flex items-center justify-center text-clinic-primary font-bold text-xl">
            📋
          </div>
          <h3 className="font-bold text-base text-clinic-ink">ไม่พบรายการบันทึกการรักษา</h3>
          <p className="text-xs max-w-md mx-auto text-clinic-ink-soft">
            ยังไม่มีเวชระเบียนที่ตรงตามคำค้นหา คุณสามารถกดปุ่มด้านบนเพื่อบันทึกการตรวจรักษาผู้ป่วยรายใหม่ได้ทันที
          </p>
          <Link
            href="/doctor/treatments/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-clinic-primary text-white text-xs font-semibold rounded-control hover:bg-clinic-primary-deep transition-colors mt-2"
          >
            + บันทึกการรักษาใหม่
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-clinic-line rounded-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-clinic-bg border-b border-clinic-line">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    รหัส / วันที่ตรวจ
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    ผู้ป่วย
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    อาการสำคัญ / การวินิจฉัย
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    การรักษาและยา
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    ค่ารักษา / ใบเสร็จ
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft text-right">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-line">
                {filteredTreatments.map((item) => {
                  const medicinesCount = item.recordTreatmentMedicines?.length || 0;
                  const receipt = item.receipt;

                  return (
                    <tr
                      key={item.recordTreatmentId}
                      className="hover:bg-clinic-bg/40 transition-colors"
                    >
                      {/* Record ID & Date */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-clinic-primary-deep">
                          #{item.recordTreatmentId}
                        </div>
                        <div className="text-xs text-clinic-ink-soft mt-0.5">
                          {formatDateThai(item.recordDate)}
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/doctor/patients/${item.patientId}`}
                          className="font-bold text-clinic-primary-deep hover:underline"
                        >
                          {item.patientFullname || `ผู้ป่วย #${item.patientId}`}
                        </Link>
                        <div className="text-[11px] text-clinic-ink-soft mt-0.5">
                          HN: {item.patientId} · แพทย์: {item.doctorFullname}
                        </div>
                      </td>

                      {/* Symptoms & Diagnosis */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="text-xs font-medium text-clinic-ink truncate">
                          {item.symptoms || "-"}
                        </div>
                        {item.ttmDiagnosis && (
                          <div className="text-[11px] text-clinic-primary font-semibold truncate mt-0.5">
                            แผนไทย: {item.ttmDiagnosis}
                          </div>
                        )}
                        {item.painScoreBefore !== null && item.painScoreBefore !== undefined && (
                          <div className="text-[10px] text-amber-700 mt-0.5">
                            ระดับความปวด: {item.painScoreBefore}/10
                            {item.painScoreAfter !== null && item.painScoreAfter !== undefined && (
                              <span> → {item.painScoreAfter}/10</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Treatment & Medicines */}
                      <td className="px-5 py-4">
                        <div className="text-xs text-clinic-ink">
                          {item.treatmentProgram ? (
                            <span className="truncate block max-w-[200px]">
                              {item.treatmentProgram}
                            </span>
                          ) : (
                            <span className="text-clinic-ink-soft">-</span>
                          )}
                        </div>
                        <div className="text-[11px] text-clinic-ink-soft mt-0.5 flex items-center gap-1">
                          <span>💊</span>
                          <span>{medicinesCount > 0 ? `ยา ${medicinesCount} รายการ` : "ไม่มียา"}</span>
                        </div>
                      </td>

                      {/* Receipt & Billing */}
                      <td className="px-5 py-4">
                        {receipt ? (
                          <div>
                            <div className="font-mono font-bold text-sm text-clinic-primary-deep">
                              ฿{receipt.totalPrice.toLocaleString()}
                            </div>
                            <span
                              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                                receipt.paymentStatus === "PAID"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {receipt.paymentStatus === "PAID" ? "ชำระแล้ว" : "ค้างชำระ"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-clinic-ink-soft">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href={`/doctor/treatments/${item.recordTreatmentId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-control text-xs font-semibold text-clinic-primary bg-clinic-bg hover:bg-clinic-primary hover:text-white border border-clinic-line transition-all shadow-2xs"
                        >
                          👁️ ดูรายละเอียด
                        </Link>
                        <Link
                          href={`/doctor/treatments/${item.recordTreatmentId}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-control text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-clinic-line transition-all shadow-2xs"
                        >
                          ✏️ แก้ไข
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
