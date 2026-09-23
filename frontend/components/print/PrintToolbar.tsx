"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, FileDown, X, Loader2, Info } from "lucide-react";

interface PrintToolbarProps {
  documentTitle: string;
  subtitle?: string;
  docxUrl?: string;
  docxFilename?: string;
  showDocx?: boolean;
}

export function PrintToolbar({
  documentTitle,
  subtitle,
  docxUrl,
  docxFilename = "document.docx",
  showDocx = true,
}: PrintToolbarProps) {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      window.close();
    } else {
      window.location.href = "/doctor/treatments";
    }
  };

  const handleDownloadDocx = async () => {
    if (!docxUrl) return;
    try {
      setDownloading(true);
      const res = await fetch(docxUrl);
      if (!res.ok) {
        throw new Error("ดาวน์โหลดเอกสาร Word ไม่สำเร็จ");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = docxFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Download docx error:", err);
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดาวน์โหลด Word");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <aside aria-label="แถบควบคุมการพิมพ์" className="no-print sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-clinic-line shadow-xs py-3 px-4 sm:px-6 mb-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-control bg-clinic-primary/10 text-clinic-primary shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-clinic-ink leading-tight">
              {documentTitle}
            </h1>
            {subtitle && (
              <p className="text-xs text-clinic-ink-soft mt-0.5 leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-clinic-primary hover:bg-clinic-primary-deep text-white font-medium shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์ / บันทึก PDF</span>
          </Button>

          {showDocx && docxUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadDocx}
              disabled={downloading}
              className="gap-1.5 text-clinic-ink hover:text-clinic-primary border-clinic-line"
              title="ดาวน์โหลดเป็นไฟล์ Microsoft Word (.docx) เพื่อแก้ไข"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin text-clinic-primary" />
              ) : (
                <FileDown className="w-4 h-4 text-clinic-primary" />
              )}
              <span>{downloading ? "กำลังโหลด..." : "ดาวน์โหลด Word (.docx)"}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="gap-1 text-clinic-ink-soft hover:text-clinic-ink"
            title="ปิดหน้าต่างนี้"
          >
            <X className="w-4 h-4" />
            <span>ปิด</span>
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-2 pt-2 border-t border-clinic-line/60 flex items-center gap-1.5 text-[11px] text-clinic-ink-soft">
        <Info className="w-3.5 h-3.5 text-clinic-primary shrink-0" />
        <span>
          คำแนะนำ: ในหน้าต่างสั่งพิมพ์ กรุณาตั้งค่าขนาดกระดาษเป็น <strong>A4</strong>, ขอบกระดาษเป็น <strong>ค่าเริ่มต้น</strong> หรือ <strong>ไม่มี</strong> และเปิด <strong>กราฟิกพื้นหลัง (Background graphics)</strong> เพื่อให้ตารางแสดงผลสมบูรณ์
        </span>
      </div>
    </aside>
  );
}
