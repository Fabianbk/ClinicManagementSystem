import { notFound } from "next/navigation";
import { getPatient } from "@/lib/resources/patients";
import { PrintToolbar } from "@/components/print/PrintToolbar";
import { PatientIntakeEnView } from "@/components/print/PatientIntakeEnView";

interface IntakeEnPrintPageProps {
  params: { patientId: string };
}

export default async function IntakeEnPrintPage({ params }: IntakeEnPrintPageProps) {
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
        documentTitle={`Patient's Personal Data (EN) - ${patient.fullname}`}
        subtitle={`HN: ${hnCode} · Pre-filled English Intake Form`}
        docxUrl={`/api/documents/patient/${patient.patientId}/intake-en`}
        docxFilename={`patient-intake-en-${patient.patientId}.docx`}
      />
      <PatientIntakeEnView patient={patient} />
    </div>
  );
}
