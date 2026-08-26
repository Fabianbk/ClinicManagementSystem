"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope, User, ChevronDown } from "lucide-react";

export function LoginMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="default"
        size="sm"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5 font-medium shadow-xs"
      >
        <span>เข้าสู่ระบบ</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-white border border-clinic-line rounded-card shadow-lg p-2 flex flex-col gap-1 z-30 animate-in fade-in-0 zoom-in-95 duration-150"
          role="menu"
        >
          <Link
            href="/doctor/login"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-start gap-3 p-2.5 rounded-control hover:bg-clinic-primary-soft transition-colors group"
          >
            <div className="w-8 h-8 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center shrink-0 group-hover:bg-clinic-primary group-hover:text-white transition-colors">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-xs block text-clinic-primary-deep">
                สำหรับแพทย์แผนไทย
              </span>
              <span className="block text-clinic-ink-soft text-[11px] mt-0.5">
                ตรวจรักษา ตารางเวร และจ่ายยา
              </span>
            </div>
          </Link>

          <Link
            href="/patient/login"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-start gap-3 p-2.5 rounded-control hover:bg-clinic-terracotta-soft transition-colors group"
          >
            <div className="w-8 h-8 rounded-control bg-clinic-terracotta-soft text-clinic-terracotta-deep flex items-center justify-center shrink-0 group-hover:bg-clinic-terracotta group-hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-xs block text-clinic-terracotta-deep">
                สำหรับผู้รับบริการ
              </span>
              <span className="block text-clinic-ink-soft text-[11px] mt-0.5">
                จองคิวออนไลน์และประวัติการรักษา
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}