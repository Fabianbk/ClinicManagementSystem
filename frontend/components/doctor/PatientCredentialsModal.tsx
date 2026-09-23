"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PatientResponseDTO } from "@/lib/types";
import {
  CheckCircle2,
  KeyRound,
  User,
  Phone,
  Mail,
  Printer,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  ExternalLink,
} from "lucide-react";

interface PatientCredentialsModalProps {
  isOpen: boolean;
  patient: PatientResponseDTO | null;
  onClose: () => void;
  onResetForm?: () => void;
}

export function PatientCredentialsModal({
  isOpen,
  patient,
  onClose,
  onResetForm,
}: PatientCredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!patient) return null;

  const hnNumber =
    patient.username || `P-${String(patient.patientId).padStart(5, "0")}`;
  const initialPassword = patient.initialPassword || "ddMMyyyy";

  function handlePrintSlip() {
    const printWindow = window.open("", "_blank", "width=600,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>ใบแจ้งข้อมูลบัญชีผู้รับบริการ - ${patient?.fullname || ""}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
          body {
            font-family: 'Sarabun', sans-serif;
            color: #1f2937;
            padding: 24px;
            margin: 0;
            background: #ffffff;
          }
          .card {
            border: 2px dashed #9ca3af;
            border-radius: 12px;
            padding: 24px;
            max-width: 480px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .title {
            font-size: 18px;
            font-weight: 700;
            color: #0f766e;
            margin: 0 0 4px 0;
          }
          .subtitle {
            font-size: 12px;
            color: #6b7280;
            margin: 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .label {
            color: #6b7280;
            font-weight: 600;
          }
          .value {
            color: #111827;
            font-weight: 700;
          }
          .cred-box {
            background: #f0fdfa;
            border: 1px solid #ccfbf1;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
          }
          .cred-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .cred-row:last-child {
            margin-bottom: 0;
          }
          .cred-label {
            font-size: 13px;
            font-weight: 600;
            color: #0f766e;
          }
          .cred-val {
            font-family: monospace;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.5px;
            color: #134e4a;
            background: #ffffff;
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid #99f6e4;
          }
          .instructions {
            font-size: 11px;
            color: #4b5563;
            line-height: 1.5;
            background: #fefce8;
            border: 1px solid #fef08a;
            padding: 10px;
            border-radius: 6px;
            margin-top: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 11px;
            color: #9ca3af;
          }
          @media print {
            body { padding: 0; }
            .card { border-style: solid; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">พิมพ์วิมานคลินิกการแพทย์แผนไทย</h1>
            <p class="subtitle">ใบแจ้งข้อมูลการเข้าสู่ระบบสำหรับผู้รับบริการ (Patient Portal Slip)</p>
          </div>

          <div class="row">
            <span class="label">ชื่อ-นามสกุล ผู้รับบริการ:</span>
            <span class="value">${patient?.fullname || "-"}</span>
          </div>
          <div class="row">
            <span class="label">รหัสประจำตัวผู้ป่วย (HN):</span>
            <span class="value" style="color: #0f766e;">${hnNumber}</span>
          </div>

          <div class="cred-box">
            <div class="cred-row">
              <span class="cred-label">ชื่อผู้ใช้ (Username / HN):</span>
              <span class="cred-val">${hnNumber}</span>
            </div>
            ${
              patient?.mobileNumber
                ? `<div class="cred-row" style="margin-top: 6px;">
                    <span class="cred-label">หรือใช้เบอร์โทรศัพท์:</span>
                    <span class="cred-val">${patient.mobileNumber}</span>
                   </div>`
                : ""
            }
            ${
              patient?.email
                ? `<div class="cred-row" style="margin-top: 6px;">
                    <span class="cred-label">หรือใช้อีเมล:</span>
                    <span class="cred-val" style="font-size: 13px;">${patient.email}</span>
                   </div>`
                : ""
            }
            <div class="cred-row" style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #99f6e4;">
              <span class="cred-label">รหัสผ่านเริ่มต้น (Password):</span>
              <span class="cred-val" style="color: #b91c1c; border-color: #fecaca; background: #fff5f5;">${initialPassword}</span>
            </div>
          </div>

          <div class="instructions">
            <strong>คำแนะนำในการใช้งาน:</strong><br/>
            1. เข้าเว็บไซต์คลินิก เลือกเมนู <strong>"เข้าสู่ระบบผู้รับบริการ"</strong><br/>
            2. กรอกชื่อผู้ใช้ (รหัส HN หรือ เบอร์โทร หรือ อีเมล) และรหัสผ่านเริ่มต้นข้างต้น<br/>
            3. เพื่อความปลอดภัยของข้อมูลสุขภาพ กรุณาเปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบครั้งแรก
          </div>

          <div class="footer">
            พิมพ์วิมานคลินิก · เอกสารนี้มีข้อมูลส่วนบุคคล กรุณาเก็บรักษาเป็นความลับ
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg text-emerald-800">
                ลงทะเบียนผู้ป่วยและสร้างบัญชีสำเร็จ
              </DialogTitle>
              <DialogDescription className="text-xs">
                ระบบได้สร้างบัญชีผู้ใช้งานสำหรับเข้าสู่ระบบผู้รับบริการ (Patient Portal) เรียบร้อยแล้ว
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Patient Identity Brief */}
        <div className="p-3 bg-clinic-bg rounded-card border border-clinic-line flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-clinic-ink">
              <User className="w-3.5 h-3.5 text-clinic-primary" />
              <span>{patient.fullname}</span>
            </div>
            <p className="text-clinic-ink-soft text-[11px]">
              สัญชาติ: {patient.citizenship || "ไทย"} · วันเกิด:{" "}
              {new Date(patient.dateOfBirth).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <Badge variant="terracotta" className="font-mono text-xs">
            HN: {hnNumber}
          </Badge>
        </div>

        {/* Credentials Display Box */}
        <div className="rounded-card border-2 border-clinic-primary/20 bg-clinic-primary/5 p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-clinic-primary/10 pb-2">
            <span className="text-xs font-bold text-clinic-primary-deep flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-clinic-primary" />
              <span>ข้อมูลเข้าสู่ระบบผู้รับบริการ (Patient Login)</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintSlip}
              className="h-7 text-xs gap-1.5 border-clinic-primary/30 text-clinic-primary hover:bg-clinic-primary/10"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบแจ้งรหัส (Print Slip)</span>
            </Button>
          </div>

          {/* Primary Username */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-clinic-ink-soft">
                ชื่อผู้ใช้งานหลัก (รหัส HN):
              </span>
              <span className="text-[11px] text-clinic-primary font-medium">
                (มีพิมพ์บนใบนัด/เอกสารตรวจ)
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-control border border-clinic-line font-mono font-bold text-sm text-clinic-ink tracking-wider">
              {hnNumber}
            </div>
          </div>

          {/* Alternative login methods if available */}
          {(patient.mobileNumber || patient.email) && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-clinic-ink-soft block">
                หรือสามารถใช้ช่องทางเหล่านี้เข้าสู่ระบบได้เช่นกัน:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {patient.mobileNumber ? (
                  <div className="p-2 bg-white rounded-control border border-clinic-line flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-clinic-ink-soft shrink-0" />
                    <span className="font-mono font-medium truncate text-clinic-ink">
                      {patient.mobileNumber}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 bg-white/50 rounded-control border border-dashed border-clinic-line text-clinic-ink-soft text-[11px]">
                    ไม่มีเบอร์โทรศัพท์
                  </div>
                )}
                {patient.email ? (
                  <div className="p-2 bg-white rounded-control border border-clinic-line flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-clinic-ink-soft shrink-0" />
                    <span className="font-mono font-medium truncate text-clinic-ink text-[11px]">
                      {patient.email}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 bg-white/50 rounded-control border border-dashed border-clinic-line text-clinic-ink-soft text-[11px]">
                    ไม่มีอีเมล
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Password Section */}
          <div className="space-y-1 pt-1 border-t border-clinic-primary/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-clinic-ink-soft">
                รหัสผ่านเริ่มต้น (Initial Password):
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-clinic-primary hover:underline flex items-center gap-1 font-medium"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>ซ่อนรหัสผ่าน</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>แสดงรหัสผ่าน</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 bg-white rounded-control border border-clinic-line font-mono font-bold text-sm tracking-wider text-rose-600 flex items-center justify-between">
              <span>
                {showPassword ? initialPassword : "•".repeat(initialPassword.length || 8)}
              </span>
              <span className="text-[10px] font-sans font-normal text-clinic-ink-soft bg-clinic-bg px-2 py-0.5 rounded">
                วันเกิด ววดดปปปป (ค.ศ.)
              </span>
            </div>
          </div>
        </div>

        {/* Security / Guidance Notice */}
        <div className="p-2.5 rounded-control bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2 items-start">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>คำแนะนำสำหรับแพทย์ / บุคลากร:</strong>
            <p className="mt-0.5 text-amber-800">
              กรุณาแจ้งข้อมูลนี้แก่ผู้รับบริการโดยตรง ณ คลินิก หรือพิมพ์ใบแจ้งรหัสมอบให้ผู้ป่วยนำกลับบ้าน โดยระบบจะแนะนำให้ผู้รับบริการเปลี่ยนรหัสผ่านใหม่ทันทีหลังจากเข้าสู่ระบบครั้งแรก
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row pt-2">
          {onResetForm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onResetForm();
              }}
              className="gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ลงทะเบียนเพิ่มอีกคน</span>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/doctor/patients">
              <span>ไปหน้ารายชื่อผู้ป่วย</span>
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="gap-1.5">
            <Link href={`/doctor/patients/${patient.patientId}`}>
              <span>ดูข้อมูลผู้ป่วยคนนี้</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
