import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPatients } from "@/lib/resources/patients";
import { PatientListClient } from "@/components/doctor/PatientListClient";
import type { PageResponse, PatientResponseDTO } from "@/lib/types";

export default async function DoctorPatientsPage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  let result: PageResponse<PatientResponseDTO> | null = null;
  try {
    result = await getPatients(0, 50);
  } catch (err) {
    console.error("Failed to fetch patients:", err);
  }

  return <PatientListClient initialData={result} />;
}