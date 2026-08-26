import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { Stethoscope } from "lucide-react";

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
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-clinic-bg">
      <div className="flex flex-col sm:flex-row w-full max-w-md bg-white rounded-card border border-clinic-line overflow-hidden shadow-xl">
        <div
          className="bg-clinic-primary text-white flex items-center justify-center font-display font-bold text-xs tracking-widest sm:[writing-mode:vertical-rl] py-3 sm:py-0 sm:w-12 shrink-0 gap-2"
          aria-hidden="true"
        >
          <Stethoscope className="w-4 h-4 sm:rotate-90" />
          <span>แพทย์แผนไทย</span>
        </div>
        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-wider text-clinic-terracotta-deep uppercase">
            พิมพ์วิมาน · คลินิกการแพทย์แผนไทย
          </p>
          <h1 className="text-2xl font-display font-bold text-clinic-primary-deep mt-1">
            เข้าสู่ระบบสำหรับแพทย์
          </h1>
          <p className="text-clinic-ink-soft text-xs mb-5 leading-relaxed">
            ระบบบันทึกเวชระเบียน ตรวจรักษา ตารางเวร และจ่ายยาสมุนไพร
          </p>

          <LoginForm
            role="DOCTOR"
            loginPath="/api/auth/doctor/login"
            defaultRedirect="/doctor/patients"
            nextPath={searchParams.next}
          />

          <p className="mt-5 text-xs text-clinic-ink-soft text-center">
            สำหรับผู้รับบริการทั่วไป?{" "}
            <Link href="/patient/login" className="font-semibold text-clinic-terracotta-deep hover:underline">
              เข้าสู่ระบบผู้ป่วยที่นี่
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}