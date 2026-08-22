"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeafIcon } from "@/components/site/icons";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface NavItem {
  label: string;
  href: string;
  built: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "ผู้ป่วย", href: "/doctor/patients", built: true },
  { label: "ตารางเวร", href: "/doctor/schedule", built: true },
  { label: "การนัดหมาย", href: "/doctor/appointments", built: true },
  { label: "การรักษา", href: "/doctor/treatments", built: true },
  { label: "คลังยา", href: "/doctor/medicine", built: true },
];

export function DoctorNavbar({ username }: { username?: string }) {
  const pathname = usePathname();

  return (
    <header className="bg-clinic-primary-deep text-white shadow-md sticky top-0 z-30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left side: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/doctor/patients"
              className="flex items-center gap-2.5 font-display font-bold text-lg text-white hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
                <LeafIcon width={20} height={20} className="text-clinic-accent" />
              </div>
              <span className="hidden sm:inline-block tracking-tight">พิมพ์วิมานคลินิก</span>
            </Link>
            <span className="bg-clinic-accent/20 text-clinic-accent border border-clinic-accent/30 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              หมอ
            </span>
          </div>

          {/* Center: Navigation Menu */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              if (!item.built) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white/35 text-xs sm:text-sm cursor-not-allowed select-none whitespace-nowrap"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] bg-white/5 text-white/40 px-1.5 py-0.2 rounded border border-white/5">
                      เร็วๆ นี้
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-white/15 text-white shadow-xs border border-white/20"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Doctor Profile & Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {username && (
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-white/90 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>นายแพทย์ {username}</span>
              </div>
            )}
            <LogoutButton redirectTo="/doctor/login" />
          </div>
        </div>
      </div>
    </header>
  );
}
