"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  Loader2,
  ChevronDown,
  FileText,
  CreditCard,
  Globe,
  Printer,
} from "lucide-react";
import type { PatientDocType } from "./DownloadDocxButton";

interface PatientDocumentDropdownProps {
  patientId: number;
  patientName?: string;
  label?: string;
  showLabel?: boolean;
  align?: "start" | "end" | "center";
  variant?: "default" | "terracotta" | "accent" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function PatientDocumentDropdown({
  patientId,
  patientName,
  label = "เอกสาร / พิมพ์ A4",
  showLabel = true,
  align = "end",
  variant = "outline",
  size = "sm",
  className,
}: PatientDocumentDropdownProps) {
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);

  const handleDownload = async (docType: PatientDocType) => {
    try {
      setLoadingDoc(docType);

      const endpoint = `/api/documents/patient/${patientId}/${docType}`;

      const res = await fetch(endpoint);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "ดาวน์โหลดไฟล์ไม่สำเร็จ");
      }

      const disposition = res.headers.get("Content-Disposition");
      let filename = `${docType}-patient-${patientId}.docx`;

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
    } catch (err: unknown) {
      console.error("Download error:", err);
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร");
    } finally {
      setLoadingDoc(null);
    }
  };

  const isLoading = loadingDoc !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isLoading}
          className={className}
          title="พิมพ์เอกสารหรือดาวน์โหลด Word (.docx)"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-clinic-primary shrink-0" />
          ) : (
            <Printer className="w-4 h-4 mr-1.5 text-clinic-primary shrink-0" />
          )}
          {showLabel && <span>{isLoading ? "กำลังสร้าง..." : label}</span>}
          <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-72">
        <DropdownMenuLabel className="font-medium text-clinic-ink">
          เอกสารเวชระเบียนประจำตัว
          {patientName && (
            <span className="block text-[11px] font-normal text-clinic-ink-muted truncate">
              {patientName}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Section 1: Print A4 */}
        <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          สั่งพิมพ์ / บันทึก PDF (A4)
        </div>
        <DropdownMenuItem asChild>
          <a
            href={`/print/opd-card/${patientId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 py-2 cursor-pointer"
          >
            <div className="p-1.5 rounded-control bg-clinic-primary-soft text-clinic-primary shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-clinic-ink">บัตรเวชระเบียน (OPD Card)</span>
              <span className="text-[10px] text-clinic-ink-muted">ตาราง 2x2 ติดหน้าแฟ้ม</span>
            </div>
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href={`/print/intake-th/${patientId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 py-2 cursor-pointer"
          >
            <div className="p-1.5 rounded-control bg-clinic-primary-soft text-clinic-primary shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-clinic-ink">แบบกรอกประวัติ (ไทย)</span>
              <span className="text-[10px] text-clinic-ink-muted">แบบฟอร์มขึ้นทะเบียน 13 หลัก</span>
            </div>
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href={`/print/intake-en/${patientId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 py-2 cursor-pointer"
          >
            <div className="p-1.5 rounded-control bg-clinic-primary-soft text-clinic-primary shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-clinic-ink">Personal Data (English)</span>
              <span className="text-[10px] text-clinic-ink-muted">Foreigner Intake Form</span>
            </div>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Section 2: Download Word */}
        <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          ดาวน์โหลด Word (.docx)
        </div>
        <DropdownMenuItem
          onClick={() => handleDownload("opd-card")}
          disabled={isLoading}
          className="flex items-center gap-2.5 cursor-pointer py-1.5"
        >
          <FileDown className="w-4 h-4 text-clinic-primary shrink-0" />
          <span className="text-xs">OPD Card (.docx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDownload("intake-th")}
          disabled={isLoading}
          className="flex items-center gap-2.5 cursor-pointer py-1.5"
        >
          <FileDown className="w-4 h-4 text-clinic-primary shrink-0" />
          <span className="text-xs">แบบกรอกประวัติไทย (.docx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDownload("intake-en")}
          disabled={isLoading}
          className="flex items-center gap-2.5 cursor-pointer py-1.5"
        >
          <FileDown className="w-4 h-4 text-clinic-primary shrink-0" />
          <span className="text-xs">Personal Data EN (.docx)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
