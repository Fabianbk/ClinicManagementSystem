"use client";

import { DownloadDocxButton } from "./DownloadDocxButton";
import { FileText, Globe, CreditCard, ClipboardList, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      type: "intake-th" as const,
      title: "แบบกรอกประวัติผู้ป่วย (ไทย)",
      templateFile: "patient_intake_th.docx",
      icon: FileText,
      description:
        "แบบฟอร์มขึ้นทะเบียนประวัติผู้ป่วยภาษาไทย พร้อมช่องกรอกเลขบัตรประชาชน 13 หลักแยกช่อง และที่อยู่ละเอียด",
      badgeText: "แบบฟอร์มไทย",
      badgeVariant: "secondary" as const,
    },
    {
      type: "intake-en" as const,
      title: "Patient’s Personal Data (EN)",
      templateFile: "patient_intake_en.docx",
      icon: Globe,
      description:
        "แบบฟอร์มประวัติภาษาอังกฤษสากลสำหรับชาวต่างชาติ ระบุเลข Passport, กรุ๊ปเลือด, ผู้ติดต่อฉุกเฉิน และประวัติแพ้ยา",
      badgeText: "English Form",
      badgeVariant: "accent" as const,
    },
    {
      type: "opd-card" as const,
      title: "บัตรเวชระเบียน (OPD Card)",
      templateFile: "opd_card.docx",
      icon: CreditCard,
      description:
        "ตารางข้อมูลเวชระเบียน 2x2 กะทัดรัด รวม HN, เลข ปชช., กรุ๊ปเลือด, สิทธิการรักษา และโรคประจำตัว เหมาะสำหรับพิมพ์ติดหน้าแฟ้ม",
      badgeText: "บัตรหน้าแฟ้ม",
      badgeVariant: "terracotta" as const,
    },
    {
      type: "intake-form" as const,
      title: "เวชระเบียนฉบับเต็ม (5 หน้า)",
      templateFile: "client_intake_form.docx",
      icon: ClipboardList,
      description:
        "เอกสารเวชระเบียนการแพทย์แผนไทยฉบับเต็ม 5 หน้า ครอบคลุมธาตุสมุฏฐาน ตรวจร่างกาย วินิจฉัย และแผนการรักษา",
      badgeText: "ฉบับสมบูรณ์ 5 หน้า",
      badgeVariant: "outline" as const,
    },
  ];

  return (
    <div className="bg-white border border-clinic-line rounded-card p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-clinic-line pb-3">
        <div>
          <h2 className="text-base font-semibold text-clinic-ink flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-clinic-primary" />
            <span>เอกสารและแบบฟอร์มเวชระเบียน Word (.docx)</span>
          </h2>
          <p className="text-xs text-clinic-ink-muted mt-0.5">
            ส่งออกเอกสาร Word พร้อมเติมข้อมูลของ {patientName} ลงในเทมเพลตให้อัตโนมัติ สามารถนำไปแก้ไขหรือพิมพ์ต่อได้ทันที
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                <p className="text-xs text-clinic-ink-soft leading-relaxed line-clamp-2">
                  {doc.description}
                </p>
                <div className="text-[11px] font-mono text-clinic-ink-muted flex items-center gap-1">
                  <span>ไฟล์เทมเพลต:</span>
                  <code className="text-clinic-primary bg-clinic-bg px-1 rounded">{doc.templateFile}</code>
                </div>
              </div>

              <div className="pt-2 border-t border-clinic-line/40 flex items-center justify-end">
                <DownloadDocxButton
                  patientId={patientId}
                  docType={doc.type}
                  label={`โหลด ${doc.title}`}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs font-medium text-clinic-primary hover:bg-clinic-primary hover:text-white"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
