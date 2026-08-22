import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getWorkingSchedules } from "@/lib/resources/working-schedules";
import { getDoctors } from "@/lib/resources/doctors";
import { PatientBookAppointmentClient } from "@/components/patient/PatientBookAppointmentClient";

export default async function PatientBookPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/patient/login");
  }

  const [schedulesData, doctorsData] = await Promise.all([
    getWorkingSchedules(0, 100).catch(() => ({ content: [] })),
    getDoctors(0, 100).catch(() => ({ content: [] })),
  ]);

  // Filter only schedules today or in the future
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const futureSchedules = (schedulesData.content || []).filter((s) => {
    const sDate = new Date(s.date);
    return sDate >= now;
  });

  return (
    <PatientBookAppointmentClient
      patientId={session.id}
      initialSchedules={futureSchedules}
      initialDoctors={doctorsData.content || []}
    />
  );
}

