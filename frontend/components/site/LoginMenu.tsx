"use client";

import { useState } from "react";
import Link from "next/link";

export function LoginMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="login-menu"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="btn btn--primary login-menu__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        เข้าสู่ระบบ
      </button>

      {open && (
        <div className="login-menu__panel" role="menu">
          <Link href="/doctor/login" role="menuitem">
            สำหรับแพทย์
            <small>จัดการประวัติ ตารางเวร และการรักษา</small>
          </Link>
          <Link href="/patient/login" role="menuitem">
            สำหรับผู้ป่วย
            <small>จองคิวและดูประวัติการรักษา</small>
          </Link>
        </div>
      )}
    </div>
  );
}