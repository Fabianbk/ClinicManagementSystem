"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeafIcon } from "@/components/site/icons";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "หน้าหลัก", href: "/patient/dashboard" },
  { label: "การนัดหมายของฉัน", href: "/patient/appointments" },
  { label: "จองคิวออนไลน์", href: "/patient/book" },
  { label: "ประวัติการรักษา", href: "/patient/treatments" },
  { label: "ข้อมูลส่วนตัว", href: "/patient/profile" },
];

export function PatientNavbar({
  patientName,
  username,
}: {
  patientName?: string;
  username?: string;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-clinic-primary-deep text-white shadow-md sticky top-0 z-30 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left side: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/patient/dashboard"
              className="flex items-center gap-2.5 font-display font-bold text-lg text-white hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-clinic-accent/20 flex items-center justify-center border border-clinic-accent/30 shadow-inner">
                <LeafIcon width={20} height={20} className="text-clinic-accent" />
              </div>
              <span className="hidden sm:inline-block tracking-tight">พิมพ์วิมานคลินิก</span>
            </Link>
            <span className="bg-clinic-accent/25 text-clinic-accent border border-clinic-accent/40 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              ผู้ป่วย
            </span>
          </div>

          {/* Center: Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/patient/dashboard"
                  ? pathname === "/patient/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-white/20 text-white shadow-xs border border-white/25 font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Patient Profile & Logout */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {(patientName || username) && (
              <div className="flex items-center gap-2 text-xs font-medium text-white/95 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-clinic-accent animate-pulse" />
                <span className="max-w-[150px] truncate">{patientName || username}</span>
              </div>
            )}
            <LogoutButton redirectTo="/patient/login" />
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-md bg-white/10 hover:bg-white/15 text-white focus:outline-none focus:ring-2 focus:ring-clinic-accent transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-clinic-primary-deep/95 backdrop-blur-md border-b border-white/10 px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {(patientName || username) && (
            <div className="px-3 py-2 text-xs font-medium text-clinic-accent border-b border-white/10 flex items-center justify-between">
              <span>ผู้รับบริการ: {patientName || username}</span>
              <span className="font-mono text-white/60 text-[11px]">{username}</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/patient/dashboard"
                  ? pathname === "/patient/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                    active
                      ? "bg-white/20 text-white font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-clinic-accent" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-end">
            <LogoutButton redirectTo="/patient/login" />
          </div>
        </div>
      )}
    </header>
  );
}
