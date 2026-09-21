import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDoctor } from "@/lib/resources/doctors";
import { getWorkingSchedulesByDoctor } from "@/lib/resources/working-schedules";
import { ScheduleManagerClient } from "@/components/doctor/ScheduleManagerClient";
import type { WorkingScheduleResponseDTO } from "@/lib/types";

export default async function DoctorSchedulePage() {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  let doctorName = session.fullname || "";
  let schedules: WorkingScheduleResponseDTO[] = [];
  try {
    const [doc, schList] = await Promise.all([
      doctorName ? Promise.resolve(null) : getDoctor(session.id).catch(() => null),
      getWorkingSchedulesByDoctor(session.id).catch(() => []),
    ]);
    if (doc?.fullname) {
      doctorName = doc.fullname;
    } else if (!doctorName) {
      doctorName = session.username;
    }
    schedules = schList;
    schedules.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("Failed to load doctor working schedules:", err);
  }

  return (
    <ScheduleManagerClient
      doctorId={session.id}
      doctorName={doctorName}
      doctorUsername={session.username}
      initialSchedules={schedules}
    />
  );
}
