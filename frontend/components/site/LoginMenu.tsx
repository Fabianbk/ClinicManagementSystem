"use client";

import { useState } from "react";
import Link from "next/link";

export function LoginMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-clinic-primary-deep focus:ring-offset-2 cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        เข้าสู่ระบบ
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-clinic-line rounded-control shadow-xl p-2 flex flex-col gap-1 z-30" role="menu">
          <Link
            href="/doctor/login"
            role="menuitem"
            className="block p-2.5 rounded-md hover:bg-clinic-bg transition-colors group"
          >
            <span className="font-semibold text-sm block text-clinic-primary-deep group-hover:text-clinic-primary">
              สำหรับแพทย์
            </span>
            <span className="block text-clinic-ink-soft text-xs mt-0.5">
              จัดการประวัติ ตารางเวร และการรักษา
            </span>
          </Link>
          <Link
            href="/patient/login"
            role="menuitem"
            className="block p-2.5 rounded-md hover:bg-clinic-bg transition-colors group"
          >
            <span className="font-semibold text-sm block text-clinic-accent-deep group-hover:text-clinic-accent">
              สำหรับผู้ป่วย
            </span>
            <span className="block text-clinic-ink-soft text-xs mt-0.5">
              จองคิวและดูประวัติการรักษา
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}