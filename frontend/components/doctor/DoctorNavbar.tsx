"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Users, Calendar, Clock, FileText, Pill, Star } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "ผู้ป่วย", href: "/doctor/patients", icon: Users },
  { label: "ตารางเวร", href: "/doctor/schedule", icon: Clock },
  { label: "การนัดหมาย", href: "/doctor/appointments", icon: Calendar },
  { label: "การรักษา", href: "/doctor/treatments", icon: FileText },
  { label: "คลังยา", href: "/doctor/medicine", icon: Pill },
  { label: "รีวิว", href: "/doctor/reviews", icon: Star },
];

export function DoctorNavbar({ username }: { username?: string }) {
  const pathname = usePathname();

  return (
    <header className="bg-clinic-primary-deep text-white shadow-sm sticky top-0 z-30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left side: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/doctor/patients"
              className="flex items-center gap-2.5 font-display font-bold text-lg text-white hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-white/20 shadow-inner flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="โลโก้คลินิกพิมพ์วิมาน"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="hidden sm:inline-block tracking-tight font-display">
                พิมพ์วิมานคลินิก
              </span>
            </Link>
            <span className="bg-clinic-terracotta/30 text-clinic-terracotta-soft border border-clinic-terracotta/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              แพทย์แผนไทย
            </span>
          </div>

          {/* Center: Navigation Menu */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-white/20 text-white shadow-xs border border-white/20 font-semibold"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side: Doctor Profile & Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {username && (
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-white/90 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>พท. {username}</span>
              </div>
            )}
            <LogoutButton redirectTo="/doctor/login" />
          </div>
        </div>
      </div>
    </header>
  );
}
