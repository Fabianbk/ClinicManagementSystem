import Link from "next/link";
import Image from "next/image";
import { LoginMenu } from "./LoginMenu";

export function NavBar() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-clinic-line shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-display font-bold text-lg text-clinic-primary-deep hover:opacity-90 transition-opacity">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-clinic-primary/20 shadow-xs shrink-0 bg-white">
            <Image
              src="/logo.png"
              alt="โลโก้คลินิกการแพทย์แผนไทย พิมพ์วิมาน"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight text-base sm:text-lg">พิมพ์วิมานคลินิก</span>
            <span className="text-[10px] text-clinic-terracotta font-medium tracking-wide">การแพทย์แผนไทย</span>
          </div>
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