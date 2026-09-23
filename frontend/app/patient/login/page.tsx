import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import Image from "next/image";
import { User, ArrowLeft, Home } from "lucide-react";

export default async function PatientLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const session = await getSession();
  if (session?.role === "PATIENT") {
    redirect(searchParams.next || "/patient/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-clinic-bg">
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-clinic-ink-soft hover:text-clinic-terracotta transition-colors py-1.5 px-3 rounded-control hover:bg-white/80 border border-transparent hover:border-clinic-line shadow-xs group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>กลับสู่หน้าหลัก</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row w-full max-w-md bg-white rounded-card border border-clinic-line overflow-hidden shadow-xl">
        <div
          className="bg-clinic-terracotta text-white flex items-center justify-center font-display font-bold text-xs tracking-widest sm:[writing-mode:vertical-rl] py-3 sm:py-0 sm:w-12 shrink-0 gap-2"
          aria-hidden="true"
        >
          <User className="w-4 h-4 sm:rotate-90" />
          <span>ผู้รับบริการ</span>
        </div>
        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-1">
          <Link
            href="/"
            title="กลับสู่หน้าหลัก"
            className="flex items-center gap-2.5 mb-2 group w-fit hover:opacity-90 transition-opacity"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-clinic-primary/20 shadow-xs shrink-0 bg-white group-hover:border-clinic-terracotta/40 transition-colors">
              <Image
                src="/logo.png"
                alt="โลโก้คลินิกพิมพ์วิมาน"
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-clinic-terracotta uppercase leading-none group-hover:underline">
                พิมพ์วิมานคลินิก
              </p>
              <p className="text-[10px] text-clinic-ink-soft leading-tight">
                การแพทย์แผนไทย
              </p>
            </div>
          </Link>
          <h1 className="text-2xl font-display font-bold text-clinic-primary-deep mt-1">
            เข้าสู่ระบบผู้รับบริการ
          </h1>
          <p className="text-clinic-ink-soft text-xs mb-5 leading-relaxed">
            จองคิวตรวจออนไลน์ ตรวจสอบนัดหมาย และดูประวัติการรักษา
          </p>

          <LoginForm
            role="PATIENT"
            loginPath="/api/auth/patient/login"
            defaultRedirect="/patient/dashboard"
            nextPath={searchParams.next}
          />

          <div className="mt-5 pt-4 border-t border-clinic-line/60 flex flex-col gap-2.5 text-center text-xs text-clinic-ink-soft">
            <p>
              สำหรับบุคลากรทางการแพทย์?{" "}
              <Link href="/doctor/login" className="font-semibold text-clinic-primary hover:underline">
                เข้าสู่ระบบแพทย์ที่นี่
              </Link>
            </p>
            <p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 font-medium text-clinic-ink-soft hover:text-clinic-terracotta transition-colors hover:underline"
              >
                <Home className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าหลักคลินิก</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}