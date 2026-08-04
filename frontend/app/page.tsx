import { NavBar } from "@/components/site/NavBar";
import {
  CalendarIcon,
  PhoneIcon,
  BadgeIcon,
  MortarIcon,
  HandsIcon,
  LeafIcon,
  LeafPattern,
} from "@/components/site/icons";

export default function HomePage() {
  return (
    <>
      <NavBar />

      <section className="hero">
        <div>
          <span className="hero__eyebrow">
            <LeafIcon width={14} height={14} />
            การแพทย์แผนไทยประยุกต์
          </span>

          <h1 className="hero__heading">
            ดูแลสุขภาพแบบองค์รวม
            <br />
            ด้วย<span>ศาสตร์แห่งสมุนไพร</span>
          </h1>

          <p className="hero__subtext">
            พิมพ์วิมานคลินิกให้บริการตรวจรักษาโรคทั่วไปด้วยศาสตร์การแพทย์แผนไทย
            นวดบำบัด ประคบสมุนไพร และจ่ายยาสมุนไพร โดยแพทย์แผนไทยผู้เชี่ยวชาญ
            ใส่ใจทุกรายละเอียดเพื่อสุขภาพที่ดีของคุณ
          </p>

          <div className="hero__actions">
            <a href="/patient/login" className="btn btn--primary">
              <CalendarIcon width={18} height={18} />
              จองนัดหมาย
            </a>
            <a href="#contact" className="btn btn--outline">
              <PhoneIcon width={18} height={18} />
              ติดต่อเรา
            </a>
          </div>
        </div>

        <div className="hero__visual">
          <LeafPattern />
          <div className="hero__badge">
            <span className="hero__badge-icon">
              <BadgeIcon width={20} height={20} />
            </span>
            <span className="hero__badge-text">
              <strong>แพทย์แผนไทยพิมพ์วิมาน</strong>
              <span>ใบอนุญาตเลขที่ 12345678</span>
            </span>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <article className="service-card">
          <span className="service-card__icon"><HandsIcon width={22} height={22} /></span>
          <h3>นวดแผนไทย</h3>
          <p>ผ่อนคลายกล้ามเนื้อและปรับสมดุลร่างกายด้วยศาสตร์การนวดแผนไทยดั้งเดิม</p>
        </article>
        <article className="service-card">
          <span className="service-card__icon"><LeafIcon width={22} height={22} /></span>
          <h3>ประคบสมุนไพร</h3>
          <p>บรรเทาอาการปวดเมื่อยและอักเสบด้วยลูกประคบสมุนไพรไทยแท้</p>
        </article>
        <article className="service-card">
          <span className="service-card__icon"><MortarIcon width={22} height={22} /></span>
          <h3>จ่ายยาสมุนไพร</h3>
          <p>ปรุงยาสมุนไพรเฉพาะบุคคล โดยแพทย์แผนไทยผู้เชี่ยวชาญ</p>
        </article>
      </section>

      <footer className="site-footer" id="contact">
        <div className="site-footer__inner">
          <div>
            <strong>พิมพ์วิมานคลินิกการแพทย์แผนไทย</strong>
            123 ถ.สุขุมวิท ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200
          </div>
          <div>
            <strong>เวลาทำการ</strong>
            จันทร์ – เสาร์ 9:00 – 17:00 น.
          </div>
          <div>
            <strong>ติดต่อ</strong>
            095-123-4567
          </div>
          <p className="site-footer__copy">
            © 2026 พิมพ์วิมานคลินิกการแพทย์แผนไทย
          </p>
        </div>
      </footer>
    </>
  );
}