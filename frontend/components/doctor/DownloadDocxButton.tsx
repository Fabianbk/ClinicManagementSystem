"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

export type PatientDocType = "intake-th" | "intake-en" | "opd-card" | "intake-form";

export interface DownloadDocxButtonProps {
  patientId?: number;
  recordTreatmentId?: number;
  docType?: PatientDocType;
  label?: string;
  variant?: "default" | "terracotta" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

export function DownloadDocxButton({
  patientId,
  recordTreatmentId,
  docType,
  label,
  variant = "outline",
  size = "sm",
  className,
  icon,
  showIcon = true,
}: DownloadDocxButtonProps) {
  const [loading, setLoading] = useState(false);

  // Determine default label based on docType if not provided
  let defaultLabel = "ดาวน์โหลดแบบบันทึก (Word)";
  if (docType === "intake-th") defaultLabel = "แบบกรอกประวัติ (ไทย)";
  else if (docType === "intake-en") defaultLabel = "แบบกรอกประวัติ (EN)";
  else if (docType === "opd-card") defaultLabel = "บัตรเวชระเบียน (OPD Card)";
  else if (docType === "intake-form") defaultLabel = "เวชระเบียนฉบับเต็ม";

  const buttonLabel = label ?? defaultLabel;

  const handleDownload = async () => {
    try {
      setLoading(true);

      let endpoint = "";
      let fallbackFilename = "document.docx";

      if (docType && patientId) {
        endpoint = `/api/documents/patient/${patientId}/${docType}`;
        fallbackFilename = `${docType}-patient-${patientId}.docx`;
      } else if (recordTreatmentId) {
        endpoint = `/api/documents/intake-form/treatment/${recordTreatmentId}`;
        fallbackFilename = `treatment-record-${recordTreatmentId}.docx`;
      } else if (patientId) {
        endpoint = `/api/documents/intake-form/patient/${patientId}`;
        fallbackFilename = `client-intake-patient-${patientId}.docx`;
      } else {
        throw new Error("Missing patientId or recordTreatmentId");
      }

      const res = await fetch(endpoint);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "ดาวน์โหลดไฟล์ไม่สำเร็จ");
      }

      // Extract filename from header or fallback
      const disposition = res.headers.get("Content-Disposition");
      let filename = fallbackFilename;

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
      console.error("Download docx error:", err);
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
      title={`ดาวน์โหลดเอกสาร Word (.docx): ${buttonLabel}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-clinic-primary shrink-0" />
          <span>กำลังโหลด...</span>
        </>
      ) : (
        <>
          {showIcon && (icon || <FileDown className="w-4 h-4 mr-1.5 text-clinic-primary shrink-0" />)}
          {buttonLabel && <span>{buttonLabel}</span>}
        </>
      )}
    </Button>
  );
}
