import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRecordTreatment } from "@/lib/resources/record-treatments";
import { getPatient } from "@/lib/resources/patients";
import { TreatmentDetailClient } from "@/components/doctor/TreatmentDetailClient";
import { ApiError } from "@/lib/api-client";
import type { RecordTreatmentResponseDTO, PatientResponseDTO } from "@/lib/types";

export default async function TreatmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  const treatmentId = Number(params.id);
  if (isNaN(treatmentId)) {
    notFound();
  }

  let treatment: RecordTreatmentResponseDTO | null = null;
  let patient: PatientResponseDTO | null = null;

  try {
    treatment = await getRecordTreatment(treatmentId);
    if (treatment && treatment.patientId) {
      patient = await getPatient(treatment.patientId).catch(() => null);
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    console.error("Failed to load treatment detail:", err);
  }

  if (!treatment) {
    notFound();
  }

  return (
    <TreatmentDetailClient
      treatment={treatment}
      patient={patient}
      currentDoctorId={session.id}
    />
  );
}
