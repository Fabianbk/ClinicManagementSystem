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
  ClipboardList,
  Globe,
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

interface DocOption {
  type: PatientDocType;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DOC_OPTIONS: DocOption[] = [
  {
    type: "intake-th",
    title: "แบบกรอกประวัติ (ภาษาไทย)",
    subtitle: "แบบฟอร์มขึ้นทะเบียน 13 หลักแยกช่อง",
    icon: FileText,
  },
  {
    type: "intake-en",
    title: "Personal Data (ภาษาอังกฤษ)",
    subtitle: "Patient Intake Form for foreigners",
    icon: Globe,
  },
  {
    type: "opd-card",
    title: "บัตรเวชระเบียน (OPD Card)",
    subtitle: "ตารางสรุป 2x2 สำหรับติดหน้าแฟ้ม",
    icon: CreditCard,
  },
  {
    type: "intake-form",
    title: "เวชระเบียนฉบับเต็ม (5 หน้า)",
    subtitle: "ประวัติสุขภาพ ธาตุสมุฏฐาน และการรักษา",
    icon: ClipboardList,
  },
];

export function PatientDocumentDropdown({
  patientId,
  patientName,
  label = "ดาวน์โหลด Word",
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

      const endpoint =
        docType === "intake-form"
          ? `/api/documents/intake-form/patient/${patientId}`
          : `/api/documents/patient/${patientId}/${docType}`;

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
          title="ดาวน์โหลดเอกสาร Word (.docx) รูปแบบต่างๆ"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-clinic-primary shrink-0" />
          ) : (
            <FileDown className="w-4 h-4 mr-1.5 text-clinic-primary shrink-0" />
          )}
          {showLabel && <span>{isLoading ? "กำลังสร้าง..." : label}</span>}
          <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-72">
        <DropdownMenuLabel className="font-medium text-clinic-ink">
          ดาวน์โหลดเอกสาร Word (.docx)
          {patientName && (
            <span className="block text-[11px] font-normal text-clinic-ink-muted truncate">
              {patientName}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {DOC_OPTIONS.map((opt, index) => {
          const Icon = opt.icon;
          const isCurrentLoading = loadingDoc === opt.type;

          return (
            <div key={opt.type}>
              {index === 3 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => handleDownload(opt.type)}
                disabled={isLoading}
                className="py-2.5 px-3 flex items-start gap-2.5 cursor-pointer hover:bg-clinic-bg focus:bg-clinic-bg"
              >
                <div className="p-1.5 rounded-control bg-clinic-primary-soft text-clinic-primary shrink-0 mt-0.5">
                  {isCurrentLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-clinic-ink leading-tight">
                    {opt.title}
                  </span>
                  <span className="text-[10px] text-clinic-ink-muted leading-tight mt-0.5">
                    {opt.subtitle}
                  </span>
                </div>
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
