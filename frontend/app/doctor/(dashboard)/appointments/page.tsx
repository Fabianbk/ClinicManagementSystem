import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDoctor } from "@/lib/resources/doctors";
import { getAppointmentsByDoctorId } from "@/lib/resources/appointments";
import { AppointmentListClient } from "@/components/doctor/AppointmentListClient";
import type { PageResponse, AppointmentResponseDTO } from "@/lib/types";

export default async function DoctorAppointmentsPage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  let doctorName = session.fullname || "";
  let appointmentsData: PageResponse<AppointmentResponseDTO> | null = null;
  try {
    const [doc, appts] = await Promise.all([
      doctorName ? Promise.resolve(null) : getDoctor(session.id).catch(() => null),
      getAppointmentsByDoctorId(session.id, 0, 100).catch(() => null),
    ]);
    if (doc?.fullname) {
      doctorName = doc.fullname;
    } else if (!doctorName) {
      doctorName = session.username;
    }
    appointmentsData = appts;
  } catch (err) {
    console.error("Failed to fetch doctor appointments:", err);
  }

  return (
    <AppointmentListClient
      doctorId={session.id}
      doctorName={doctorName}
      initialData={appointmentsData}
    />
  );
}
