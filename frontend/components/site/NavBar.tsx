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

        <nav className="flex items-center gap-7">
          <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
            <li>
              <a href="#" className="text-clinic-ink-soft hover:text-clinic-primary-deep text-sm font-medium transition-colors">
                หน้าหลัก
              </a>
            </li>
            <li>
              <a href="#services" className="text-clinic-ink-soft hover:text-clinic-primary-deep text-sm font-medium transition-colors">
                บริการของเรา
              </a>
            </li>
            <li>
              <a href="#contact" className="text-clinic-ink-soft hover:text-clinic-primary-deep text-sm font-medium transition-colors">
                เกี่ยวกับหมอ
              </a>
            </li>
          </ul>
          <LoginMenu />
        </nav>
      </div>
    </header>
  );
}