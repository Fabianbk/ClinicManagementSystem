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
    <main className="min-h-screen flex items-center justify-center p-5 bg-clinic-bg">
      <div className="flex flex-col sm:flex-row w-full max-w-md bg-white rounded-card border border-clinic-line overflow-hidden shadow-2xl">
        <div
          className="bg-clinic-primary text-white flex items-center justify-center font-display font-semibold text-xs tracking-widest sm:[writing-mode:vertical-rl] py-3 sm:py-0 sm:w-10 shrink-0"
          aria-hidden="true"
        >
          <span>DOCTOR</span>
        </div>
        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-wider text-clinic-accent-deep uppercase">
            พิมพ์วิมาน · คลินิกการแพทย์แผนไทย
          </p>
          <h1 className="text-2xl font-display font-bold text-clinic-primary-deep mt-1">
            Doctor sign-in
          </h1>
          <p className="text-clinic-ink-soft text-sm mb-5 leading-relaxed">
            Manage patient records, schedules, and treatments.
          </p>

          <LoginForm
            role="DOCTOR"
            loginPath="/api/auth/doctor/login"
            defaultRedirect="/doctor/patients"
            nextPath={searchParams.next}
          />

          <p className="mt-5 text-xs text-clinic-ink-soft text-center">
            Here to book a visit?{" "}
            <a href="/patient/login" className="font-semibold text-clinic-accent-deep hover:underline">
              Go to patient sign-in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}