import Link from "next/link";
import { LeafIcon } from "./icons";
import { LoginMenu } from "./LoginMenu";

export function NavBar() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-clinic-line shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg text-clinic-primary-deep hover:opacity-90 transition-opacity">
          <LeafIcon width={22} height={22} className="text-clinic-primary" />
          พิมพ์วิมานคลินิก
        </Link>

        <nav className="flex items-center gap-6">
          <ul className="hidden md:flex items-center gap-5 list-none m-0 p-0">
            <li>
              <Link href="/" className="text-clinic-ink-soft hover:text-clinic-primary-deep text-xs lg:text-sm font-medium transition-colors">
                หน้าหลัก
              </Link>
            </li>
            <li>
              <Link href="/#schedule" className="text-clinic-ink-soft hover:text-clinic-primary-deep text-xs lg:text-sm font-medium transition-colors">
                เวลาทำงานของแพทย์
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="text-clinic-ink-soft hover:text-clinic-primary-deep text-xs lg:text-sm font-medium transition-colors">
                รีวิวจากคนไข้
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="text-clinic-ink-soft hover:text-clinic-primary-deep text-xs lg:text-sm font-medium transition-colors">
                ข้อมูลคลินิก
              </Link>
            </li>
          </ul>
          <LoginMenu />
        </nav>
      </div>
    </header>
  );
}