import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function DoctorLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const session = await getSession();
  if (session?.role === "DOCTOR") {
    redirect(searchParams.next || "/doctor/patients");
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-card__rail login-card__rail--doctor" aria-hidden="true">
          <span>DOCTOR</span>
        </div>
        <div className="login-card__body">
          <p className="login-card__eyebrow">พิมพ์วิมาน · คลินิกการแพทย์แผนไทย</p>
          <h1 className="login-card__heading">Doctor sign-in</h1>
          <p className="login-card__subtext">
            Manage patient records, schedules, and treatments.
          </p>

          <LoginForm
            role="DOCTOR"
            loginPath="/api/auth/doctor/login"
            defaultRedirect="/doctor/patients"
            nextPath={searchParams.next}
          />

          <p className="login-card__switch">
            Here to book a visit? <a href="/patient/login">Go to patient sign-in</a>
          </p>
        </div>
      </div>
    </main>
  );
}