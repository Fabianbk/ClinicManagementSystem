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
    <aside className="doctor-sidebar">
      <div className="doctor-sidebar__brand">
        <LeafIcon width={20} height={20} />
        พิมพ์วิมานคลินิก
      </div>

      <nav className="doctor-sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          if (!item.built) {
            return (
              <span key={item.href} className="doctor-sidebar__link doctor-sidebar__link--disabled">
                {item.label}
                <small>เร็วๆ นี้</small>
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`doctor-sidebar__link${active ? " doctor-sidebar__link--active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}