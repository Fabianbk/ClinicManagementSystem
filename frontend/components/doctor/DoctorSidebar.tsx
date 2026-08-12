"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeafIcon } from "@/components/site/icons";

interface NavItem {
  label: string;
  href: string;
  built: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "ผู้ป่วย", href: "/doctor/patients", built: true },
  { label: "ตารางเวร", href: "/doctor/schedule", built: false },
  { label: "การนัดหมาย", href: "/doctor/appointments", built: false },
  { label: "การรักษา", href: "/doctor/treatments", built: false },
  { label: "คลังยา", href: "/doctor/medicine", built: false },
];

export function DoctorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-clinic-primary-deep text-white p-6 flex flex-col md:w-60 shrink-0 gap-8">
      <div className="flex items-center gap-2 font-display font-bold text-base px-2">
        <LeafIcon width={20} height={20} className="text-clinic-accent" />
        พิมพ์วิมานคลินิก
      </div>

      <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          if (!item.built) {
            return (
              <span
                key={item.href}
                className="flex flex-col px-3 py-2.5 rounded-control text-white/35 text-sm cursor-not-allowed select-none whitespace-nowrap"
              >
                <span>{item.label}</span>
                <small className="text-[10px] opacity-70">เร็วๆ นี้</small>
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col px-3 py-2.5 rounded-control text-sm transition-colors whitespace-nowrap ${
                active
                  ? "bg-white/15 text-white font-semibold shadow-xs"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}