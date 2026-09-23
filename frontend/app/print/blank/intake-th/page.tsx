import { PrintToolbar } from "@/components/print/PrintToolbar";
import { PatientIntakeThView } from "@/components/print/PatientIntakeThView";

export default function BlankIntakeThPrintPage() {
  return (
    <div className="py-6">
      <PrintToolbar
        documentTitle="แบบกรอกประวัติผู้ป่วยเปล่า (ภาษาไทย)"
        subtitle="สำหรับให้ผู้ป่วยรายใหม่กรอกข้อมูลลงบนกระดาษ A4"
        docxUrl="/api/documents/blank/intake-th"
        docxFilename="blank-patient-intake-th.docx"
      />
      <PatientIntakeThView patient={null} />
    </div>
  );
}
