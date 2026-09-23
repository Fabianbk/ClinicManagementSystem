import { notFound } from "next/navigation";
import { getPatient } from "@/lib/resources/patients";
import { PrintToolbar } from "@/components/print/PrintToolbar";
import { PatientIntakeThView } from "@/components/print/PatientIntakeThView";

interface IntakeThPrintPageProps {
  params: { patientId: string };
}

export default async function IntakeThPrintPage({ params }: IntakeThPrintPageProps) {
  const patientId = Number(params.patientId);
  if (isNaN(patientId)) {
    notFound();
  }

  const patient = await getPatient(patientId).catch(() => null);
  if (!patient) {
    notFound();
  }

  const hnCode = `P-${String(patient.patientId).padStart(5, "0")}`;

  return (
    <div className="py-6">
      <PrintToolbar
        documentTitle={`แบบกรอกประวัติผู้ป่วย (ไทย) - ${patient.fullname}`}
        subtitle={`HN: ${hnCode} · มีข้อมูลผู้ป่วยในระบบ`}
        docxUrl={`/api/documents/patient/${patient.patientId}/intake-th`}
        docxFilename={`patient-intake-th-${patient.patientId}.docx`}
      />
      <PatientIntakeThView patient={patient} />
    </div>
  );
}
