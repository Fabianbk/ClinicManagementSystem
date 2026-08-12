import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAppointmentsByDoctorId } from "@/lib/resources/appointments";
import { AppointmentListClient } from "@/components/doctor/AppointmentListClient";
import type { PageResponse, AppointmentResponseDTO } from "@/lib/types";

export default async function DoctorAppointmentsPage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  let appointmentsData: PageResponse<AppointmentResponseDTO> | null = null;
  try {
    appointmentsData = await getAppointmentsByDoctorId(session.id, 0, 100);
  } catch (err) {
    console.error("Failed to fetch doctor appointments:", err);
  }

  return (
    <AppointmentListClient
      doctorId={session.id}
      initialData={appointmentsData}
    />
  );
}
