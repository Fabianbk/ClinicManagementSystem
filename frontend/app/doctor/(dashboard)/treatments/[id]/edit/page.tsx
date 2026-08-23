import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRecordTreatment } from "@/lib/resources/record-treatments";
import { getPatient } from "@/lib/resources/patients";
import { getAllMedicines } from "@/lib/resources/medicines";
import { RecordTreatmentEditClient } from "@/components/doctor/RecordTreatmentEditClient";
import { ApiError } from "@/lib/api-client";
import type { RecordTreatmentResponseDTO, PatientResponseDTO, MedicineResponseDTO } from "@/lib/types";

export default async function TreatmentEditPage({
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
  let medicines: MedicineResponseDTO[] = [];

  try {
    const [treatmentData, medicinesData] = await Promise.all([
      getRecordTreatment(treatmentId),
      getAllMedicines(0, 100).catch(() => ({ content: [] })),
    ]);

    treatment = treatmentData;
    medicines = medicinesData.content || [];

    if (treatment && treatment.patientId) {
      patient = await getPatient(treatment.patientId).catch(() => null);
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    console.error("Failed to load treatment for edit:", err);
  }

  if (!treatment) {
    notFound();
  }

  return (
    <RecordTreatmentEditClient
      treatment={treatment}
      patient={patient}
      medicines={medicines}
      doctorId={session.id}
    />
  );
}
