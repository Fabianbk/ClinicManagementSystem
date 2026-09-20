"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";

interface MedicalCertificateDialogProps {
  recordTreatmentId: number;
  patientName: string;
  patientId: number;
  diagnosis?: string;
  doctorName?: string;
  label?: string;
  variant?: "default" | "terracotta" | "accent" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function MedicalCertificateDialog({
  recordTreatmentId,
  patientName,
  patientId,
  diagnosis,
  doctorName,
  label = "พิมพ์ใบรับรองแพทย์ (Word)",
  variant = "outline",
  size = "sm",
  className,
}: MedicalCertificateDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [includeSickLeave, setIncludeSickLeave] = useState(false);
  const [sickLeaveDays, setSickLeaveDays] = useState<number>(1);

  // Initialize with today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];
  const [sickLeaveFrom, setSickLeaveFrom] = useState(todayStr);
  const [sickLeaveTo, setSickLeaveTo] = useState(todayStr);

  const hnDisplay = `P-${String(patientId).padStart(5, "0")}`;

  // Helper to calculate To Date when From Date or Days change
  const handleDaysChange = (days: number) => {
    setSickLeaveDays(days);
    if (sickLeaveFrom && days > 0) {
      const fromD = new Date(sickLeaveFrom);
      fromD.setDate(fromD.getDate() + (days - 1));
      setSickLeaveTo(fromD.toISOString().split("T")[0]);
    }
  };

  const handleFromDateChange = (fromDate: string) => {
    setSickLeaveFrom(fromDate);
    if (fromDate && sickLeaveDays > 0) {
      const fromD = new Date(fromDate);
      fromD.setDate(fromD.getDate() + (sickLeaveDays - 1));
      setSickLeaveTo(fromD.toISOString().split("T")[0]);
    }
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  const handleDownload = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (includeSickLeave && sickLeaveDays > 0) {
        params.set("sickLeaveDays", String(sickLeaveDays));
        if (sickLeaveFrom) {
          params.set("sickLeaveFrom", formatDisplayDate(sickLeaveFrom));
        }
        if (sickLeaveTo) {
          params.set("sickLeaveTo", formatDisplayDate(sickLeaveTo));
        }
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const endpoint = `/api/documents/medical-certificate/${recordTreatmentId}${queryString}`;

      const res = await fetch(endpoint);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "ดาวน์โหลดใบรับรองแพทย์ไม่สำเร็จ");
      }

      const disposition = res.headers.get("Content-Disposition");
      let filename = `medical-certificate-${recordTreatmentId}.docx`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("สร้างและดาวน์โหลดใบรับรองแพทย์เรียบร้อยแล้ว");
      setOpen(false);
    } catch (err: unknown) {
      console.error("Medical certificate download error:", err);
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={className}
        >
          <FileCheck className="w-4 h-4 text-clinic-primary" />
          <span>{label}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-clinic-primary" />
            <span>พิมพ์ใบรับรองแพทย์ (Medical Certificate)</span>
          </DialogTitle>
          <DialogDescription>
            สร้างเอกสารใบรับรองแพทย์ (.docx) จากประวัติการรักษา สำหรับพิมพ์หรือมอบให้ผู้รับบริการ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Patient summary box */}
          <div className="bg-clinic-bg border border-clinic-line rounded-control p-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-clinic-ink-soft">ผู้รับบริการ:</span>
              <strong className="text-clinic-ink text-sm">{patientName}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-clinic-ink-soft">รหัสประจำตัวผู้ป่วย (HN):</span>
              <span className="font-mono font-semibold text-clinic-primary">{hnDisplay}</span>
            </div>
            {diagnosis && (
              <div className="flex justify-between items-center pt-1 border-t border-clinic-line">
                <span className="text-clinic-ink-soft">การวินิจฉัย:</span>
                <span className="font-medium text-clinic-ink max-w-[220px] text-right truncate">
                  {diagnosis}
                </span>
              </div>
            )}
            {doctorName && (
              <div className="flex justify-between items-center">
                <span className="text-clinic-ink-soft">แพทย์ผู้ตรวจ:</span>
                <span className="text-clinic-ink">{doctorName}</span>
              </div>
            )}
          </div>

          {/* Sick leave option */}
          <div className="space-y-3 pt-2 border-t border-clinic-line">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`sick-leave-${recordTreatmentId}`}
                checked={includeSickLeave}
                onChange={(e) => setIncludeSickLeave(e.target.checked)}
                className="w-4 h-4 rounded border-clinic-line text-clinic-primary focus:ring-clinic-primary cursor-pointer"
              />
              <Label
                htmlFor={`sick-leave-${recordTreatmentId}`}
                className="text-xs font-semibold text-clinic-ink cursor-pointer"
              >
                ระบุการขอลาป่วย (Sick Leave) ในใบรับรอง
              </Label>
            </div>

            {includeSickLeave && (
              <div className="pl-6 space-y-3 bg-clinic-primary-soft/30 p-3 rounded-control border border-clinic-primary/20">
                <div className="space-y-1">
                  <Label className="text-[11px] text-clinic-ink-soft">
                    จำนวนวันลาป่วย (วัน):
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={sickLeaveDays}
                    onChange={(e) => handleDaysChange(parseInt(e.target.value) || 1)}
                    className="h-8 text-xs bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-clinic-ink-soft">ตั้งแต่วันที่:</Label>
                    <DatePicker
                      value={sickLeaveFrom}
                      onChange={(val) => handleFromDateChange(val)}
                      placeholder="ตั้งแต่วันที่"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-clinic-ink-soft">ถึงวันที่:</Label>
                    <DatePicker
                      value={sickLeaveTo}
                      onChange={(val) => setSickLeaveTo(val)}
                      placeholder="ถึงวันที่"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={loading}
            className="gap-1.5 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังดาวน์โหลด...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>ดาวน์โหลดใบรับรองแพทย์ (.docx)</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
