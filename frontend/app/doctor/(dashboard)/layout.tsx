import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DoctorSidebar } from "@/components/doctor/DoctorSidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-clinic-bg">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-end gap-4 px-8 py-3.5 border-b border-clinic-line bg-white shadow-xs">
          <span className="text-sm font-medium text-clinic-ink-soft">
            นายแพทย์ {session.username}
          </span>
          <LogoutButton redirectTo="/doctor/login" />
        </header>
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}