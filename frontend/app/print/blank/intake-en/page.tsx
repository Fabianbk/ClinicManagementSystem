import { PrintToolbar } from "@/components/print/PrintToolbar";
import { PatientIntakeEnView } from "@/components/print/PatientIntakeEnView";

export default function BlankIntakeEnPrintPage() {
  return (
    <div className="py-6">
      <PrintToolbar
        documentTitle="Blank Patient Intake Form (English)"
        subtitle="For foreign walk-in patients to fill out on A4 paper"
        docxUrl="/api/documents/blank/intake-en"
        docxFilename="blank-patient-intake-en.docx"
      />
      <PatientIntakeEnView patient={null} />
    </div>
  );
}
