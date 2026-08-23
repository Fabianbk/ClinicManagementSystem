import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getWorkingSchedulesByDoctor } from "@/lib/resources/working-schedules";
import { ScheduleManagerClient } from "@/components/doctor/ScheduleManagerClient";
import type { WorkingScheduleResponseDTO } from "@/lib/types";

export default async function DoctorSchedulePage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  let schedules: WorkingScheduleResponseDTO[] = [];
  try {
    schedules = await getWorkingSchedulesByDoctor(session.id);
    schedules.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("Failed to load doctor working schedules:", err);
  }

  return (
    <ScheduleManagerClient
      doctorId={session.id}
      doctorUsername={session.username}
      initialSchedules={schedules}
    />
  );
}
