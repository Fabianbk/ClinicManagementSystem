import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DoctorNavbar } from "@/components/doctor/DoctorNavbar";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  return (
    <div className="min-h-screen bg-clinic-bg flex flex-col">
      <DoctorNavbar username={session.username} />
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}