"use client";

import { DownloadDocxButton } from "./DownloadDocxButton";
import { FileText, Globe, CreditCard, FileCheck, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PatientDocumentSectionProps {
  patientId: number;
  patientName: string;
}

export function PatientDocumentSection({
  patientId,
  patientName,
}: PatientDocumentSectionProps) {
  const docCards = [
    {
      type: "opd-card" as const,
      title: "บัตรเวชระเบียน (OPD Card)",
      printUrl: `/print/opd-card/${patientId}`,
      templateFile: "opd_card.docx",
      icon: CreditCard,
      description:
        "ตารางข้อมูลเวชระเบียน 2x2 กะทัดรัด รวม HN, เลข ปชช., กรุ๊ปเลือด, สิทธิการรักษา และโรคประจำตัว เหมาะสำหรับพิมพ์ติดหน้าแฟ้มประวัติ",
      badgeText: "บัตรหน้าแฟ้ม",
      badgeVariant: "terracotta" as const,
    },
    {
      type: "intake-th" as const,
      title: "แบบกรอกประวัติผู้ป่วย (ไทย)",
      printUrl: `/print/intake-th/${patientId}`,
      templateFile: "patient_intake_th.docx",
      icon: FileText,
      description:
        "แบบฟอร์มขึ้นทะเบียนประวัติผู้ป่วยภาษาไทย พร้อมช่องกรอกเลขบัตรประชาชน 13 หลักแยกช่อง และข้อมูลที่อยู่และการติดต่อฉุกเฉิน",
      badgeText: "แบบฟอร์มไทย",
      badgeVariant: "secondary" as const,
    },
    {
      type: "intake-en" as const,
      title: "Patient’s Personal Data (EN)",
      printUrl: `/print/intake-en/${patientId}`,
      templateFile: "patient_intake_en.docx",
      icon: Globe,
      description:
        "แบบฟอร์มประวัติภาษาอังกฤษสากลสำหรับชาวต่างชาติ ระบุเลข Passport, กรุ๊ปเลือด, ผู้ติดต่อฉุกเฉิน และประวัติแพ้ยา",
      badgeText: "English Form",
      badgeVariant: "accent" as const,
    },
  ];

  return (
    <div className="bg-white border border-clinic-line rounded-card p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-clinic-line pb-3">
        <div>
          <h2 className="text-base font-semibold text-clinic-ink flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-clinic-primary" />
            <span>เอกสารและแบบฟอร์มประจำตัวผู้ป่วย (Patient Documents &amp; Forms)</span>
          </h2>
          <p className="text-xs text-clinic-ink-muted mt-0.5">
            สั่งพิมพ์แบบ A4 มาตรฐาน หรือดาวน์โหลดไฟล์ Word (.docx) พร้อมเติมข้อมูลของ {patientName} ให้อัตโนมัติ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {docCards.map((doc) => {
          const Icon = doc.icon;
          return (
            <div
              key={doc.type}
              className="border border-clinic-line/80 rounded-card p-4 hover:border-clinic-primary/50 hover:bg-clinic-bg/20 transition-all flex flex-col justify-between gap-3 bg-white"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-control bg-clinic-primary-soft text-clinic-primary shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-clinic-ink leading-snug">
                      {doc.title}
                    </span>
                  </div>
                  <Badge variant={doc.badgeVariant} className="text-[10px] shrink-0 font-normal">
                    {doc.badgeText}
                  </Badge>
                </div>
                <p className="text-xs text-clinic-ink-soft leading-relaxed">
                  {doc.description}
                </p>
                <div className="text-[11px] font-mono text-clinic-ink-muted flex items-center gap-1">
                  <span>เทมเพลต:</span>
                  <code className="text-clinic-primary bg-clinic-bg px-1 rounded">{doc.templateFile}</code>
                </div>
              </div>

              <div className="pt-2 border-t border-clinic-line/40 flex flex-wrap items-center justify-end gap-2">
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="text-xs font-medium gap-1 bg-clinic-primary hover:bg-clinic-primary-deep text-white shadow-2xs"
                  title={`พิมพ์ ${doc.title} ขนาด A4`}
                >
                  <a href={doc.printUrl} target="_blank" rel="noopener noreferrer">
                    <Printer className="w-3.5 h-3.5" />
                    <span>พิมพ์ A4</span>
                  </a>
                </Button>

                <DownloadDocxButton
                  patientId={patientId}
                  docType={doc.type}
                  label="โหลด Word"
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium text-clinic-ink hover:text-clinic-primary border-clinic-line"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
