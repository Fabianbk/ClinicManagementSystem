import Link from "next/link";
import { LeafIcon } from "./icons";
import { LoginMenu } from "./LoginMenu";

export function NavBar() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo">
          <LeafIcon width={22} height={22} />
          พิมพ์วิมานคลินิก
        </Link>

        <nav className="site-nav">
          <ul className="site-nav__links">
            <li><a href="#">หน้าหลัก</a></li>
            <li><a href="#services">บริการของเรา</a></li>
            <li><a href="#contact">เกี่ยวกับหมอ</a></li>
          </ul>
          <LoginMenu />
        </nav>
      </div>
    </header>
  );
}