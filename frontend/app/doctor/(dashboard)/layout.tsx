import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DoctorSidebar } from "@/components/doctor/DoctorSidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  // Middleware already guards /doctor/*, but the layout re-checks so every
  // doctor page has a trustworthy session to read from without repeating
  // this itself — same defense-in-depth spirit as the backend's
  // @PreAuthorize + CurrentUser double-check.
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    redirect("/doctor/login");
  }

  return (
    <div className="doctor-shell">
      <DoctorSidebar />
      <div className="doctor-shell__content">
        <header className="doctor-topbar">
          <span className="doctor-topbar__user">{session.username}</span>
          <LogoutButton redirectTo="/doctor/login" />
        </header>
        <main className="doctor-main">{children}</main>
      </div>
    </div>
  );
}