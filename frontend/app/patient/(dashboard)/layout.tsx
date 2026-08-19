import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PatientNavbar } from "@/components/patient/PatientNavbar";
import { getPatient } from "@/lib/resources/patients";

export default async function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/patient/login");
  }

  let patientName = "";
  try {
    const patient = await getPatient(session.id);
    patientName = patient.fullname;
  } catch {
    patientName = session.username;
  }

  return (
    <div className="min-h-screen bg-clinic-bg flex flex-col font-body text-clinic-ink">
      <PatientNavbar patientName={patientName} username={session.username} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}
