import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAppointmentsByPatientId } from "@/lib/resources/appointments";
import { PatientAppointmentsClient } from "@/components/patient/PatientAppointmentsClient";

export default async function PatientAppointmentsPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/patient/login");
  }

  const appointmentsData = await getAppointmentsByPatientId(session.id, 0, 50).catch(
    () => ({ content: [] })
  );

  return (
    <PatientAppointmentsClient
      initialAppointments={appointmentsData.content || []}
      patientId={session.id}
    />
  );
}
