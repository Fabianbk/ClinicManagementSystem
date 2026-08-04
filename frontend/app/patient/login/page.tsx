import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function PatientLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const session = await getSession();
  if (session?.role === "PATIENT") {
    redirect(searchParams.next || "/patient/appointments");
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-card__rail login-card__rail--patient" aria-hidden="true">
          <span>PATIENT</span>
        </div>
        <div className="login-card__body">
          <p className="login-card__eyebrow">พิมพ์วิมาน · คลินิกการแพทย์แผนไทย</p>
          <h1 className="login-card__heading">Patient sign-in</h1>
          <p className="login-card__subtext">
            Book appointments and check your visit history.
          </p>

          <LoginForm
            role="PATIENT"
            loginPath="/api/auth/patient/login"
            defaultRedirect="/patient/appointments"
            nextPath={searchParams.next}
          />

          <p className="login-card__switch">
            Here for clinic work? <a href="/doctor/login">Go to doctor sign-in</a>
          </p>
        </div>
      </div>
    </main>
  );
}