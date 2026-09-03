"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

interface DownloadDocxButtonProps {
  patientId?: number;
  recordTreatmentId?: number;
  label?: string;
  variant?: "default" | "terracotta" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function DownloadDocxButton({
  patientId,
  recordTreatmentId,
  label = "ดาวน์โหลดแบบบันทึก (Word)",
  variant = "outline",
  size = "sm",
  className,
}: DownloadDocxButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const endpoint = recordTreatmentId
        ? `/api/documents/intake-form/treatment/${recordTreatmentId}`
        : `/api/documents/intake-form/patient/${patientId}`;

      const res = await fetch(endpoint);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "ดาวน์โหลดไฟล์ไม่สำเร็จ");
      }

      // Extract filename from header or fallback
      const disposition = res.headers.get("Content-Disposition");
      let filename = recordTreatmentId
        ? `treatment-record-${recordTreatmentId}.docx`
        : `client-intake-patient-${patientId}.docx`;

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
      title="ดาวน์โหลดเอกสาร Word (.docx) พร้อมข้อมูลที่กรอกเรียบร้อยแล้ว"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-clinic-primary" />
          <span>กำลังสร้างไฟล์...</span>
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-1.5 text-clinic-primary" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
