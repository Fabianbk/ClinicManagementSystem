import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDoctor } from "@/lib/resources/doctors";
import { getAppointmentsByDoctorId } from "@/lib/resources/appointments";
import { getPatients } from "@/lib/resources/patients";
import { getAllMedicines } from "@/lib/resources/medicines";
import { getAllRecordTreatments } from "@/lib/resources/record-treatments";
import { RecordTreatmentFormClient } from "@/components/doctor/RecordTreatmentFormClient";

export default async function NewTreatmentPage({
  searchParams,
}: {
  searchParams?: { appointmentId?: string; patientId?: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  const defaultAppointmentId = searchParams?.appointmentId
    ? Number(searchParams.appointmentId)
    : undefined;
  const defaultPatientId = searchParams?.patientId
    ? Number(searchParams.patientId)
    : undefined;

  const [doctorData, appointmentsData, patientsData, medicinesData, treatmentsData] =
    await Promise.all([
      getDoctor(session.id).catch(() => null),
      getAppointmentsByDoctorId(session.id, 0, 100).catch(() => ({ content: [] })),
      getPatients(0, 100).catch(() => ({ content: [] })),
      getAllMedicines(0, 100).catch(() => ({ content: [] })),
      getAllRecordTreatments(0, 200).catch(() => ({ content: [] })),
    ]);

  const doctorFullname = doctorData?.fullname || session.username;
  const existingTreatments = treatmentsData.content || [];

  return (
    <RecordTreatmentFormClient
      doctorId={session.id}
      doctorFullname={doctorFullname}
      defaultAppointmentId={defaultAppointmentId}
      defaultPatientId={defaultPatientId}
      appointments={appointmentsData.content || []}
      patients={patientsData.content || []}
      medicines={medicinesData.content || []}
      existingTreatments={existingTreatments}
    />
  );
}
