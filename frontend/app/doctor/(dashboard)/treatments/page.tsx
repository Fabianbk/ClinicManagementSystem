import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDoctor } from "@/lib/resources/doctors";
import { getAllRecordTreatments } from "@/lib/resources/record-treatments";
import { TreatmentListClient } from "@/components/doctor/TreatmentListClient";
import type { PageResponse, RecordTreatmentResponseDTO } from "@/lib/types";

export default async function DoctorTreatmentsPage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  const [doctorData, treatmentsData] = await Promise.all([
    getDoctor(session.id).catch(() => null),
    getAllRecordTreatments(0, 100).catch(() => null),
  ]);

  return (
    <TreatmentListClient
      doctorId={session.id}
      doctorName={doctorData?.fullname || session.username}
      initialData={treatmentsData}
    />
  );
}
