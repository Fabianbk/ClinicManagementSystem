import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "พิมพ์เอกสารเวชระเบียน - พิมพ์วิมานคลินิก",
};

export default async function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/doctor/login");
  }

  return (
    <div className="min-h-screen bg-slate-100/70 print:bg-white text-clinic-ink font-body">
      {children}
    </div>
  );
}
