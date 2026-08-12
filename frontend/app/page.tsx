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
    <div className="min-h-screen bg-clinic-bg text-clinic-ink">
      <NavBar />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-clinic-bg border border-clinic-line text-clinic-accent-deep text-xs font-semibold mb-5 shadow-xs">
            <LeafIcon width={14} height={14} className="text-clinic-accent-deep" />
            การแพทย์แผนไทยประยุกต์
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display leading-tight text-clinic-primary-deep mb-4 font-bold">
            ดูแลสุขภาพแบบองค์รวม
            <br />
            ด้วย<span className="text-clinic-accent-deep">ศาสตร์แห่งสมุนไพร</span>
          </h1>

          <p className="text-clinic-ink-soft text-base lg:text-lg leading-relaxed max-w-prose mb-8">
            พิมพ์วิมานคลินิกให้บริการตรวจรักษาโรคทั่วไปด้วยศาสตร์การแพทย์แผนไทย
            นวดบำบัด ประคบสมุนไพร และจ่ายยาสมุนไพร โดยแพทย์แผนไทยผู้เชี่ยวชาญ
            ใส่ใจทุกรายละเอียดเพื่อสุขภาพที่ดีของคุณ
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="/patient/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <CalendarIcon width={18} height={18} />
              จองนัดหมาย
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-clinic-ink bg-white border border-clinic-line hover:border-clinic-primary hover:text-clinic-primary-deep transition-all shadow-xs hover:shadow-sm"
            >
              <PhoneIcon width={18} height={18} />
              ติดต่อเรา
            </a>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden aspect-[4/3.4] bg-gradient-to-br from-clinic-primary-deep via-clinic-primary to-[#3E6B45] shadow-2xl p-6 flex flex-col justify-end group">
          <LeafPattern className="absolute inset-0 w-full h-full opacity-35 object-cover" />
          <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-control p-4 flex items-center gap-3.5 shadow-xl border border-white/20">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-clinic-bg flex items-center justify-center text-clinic-primary-deep">
              <BadgeIcon width={22} height={22} />
            </div>
            <div>
              <strong className="block text-sm font-semibold text-clinic-ink">
                แพทย์แผนไทยพิมพ์วิมาน
              </strong>
              <span className="block text-xs text-clinic-ink-soft">
                ใบอนุญาตเลขที่ 12345678
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white border border-clinic-line rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-clinic-bg text-clinic-primary-deep flex items-center justify-center mb-4">
              <HandsIcon width={22} height={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-clinic-primary-deep mb-2">
              นวดแผนไทย
            </h3>
            <p className="text-clinic-ink-soft text-sm leading-relaxed">
              ผ่อนคลายกล้ามเนื้อและปรับสมดุลร่างกายด้วยศาสตร์การนวดแผนไทยดั้งเดิม
            </p>
          </article>

          <article className="bg-white border border-clinic-line rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-clinic-bg text-clinic-primary-deep flex items-center justify-center mb-4">
              <LeafIcon width={22} height={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-clinic-primary-deep mb-2">
              ประคบสมุนไพร
            </h3>
            <p className="text-clinic-ink-soft text-sm leading-relaxed">
              บรรเทาอาการปวดเมื่อยและอักเสบด้วยลูกประคบสมุนไพรไทยแท้
            </p>
          </article>

          <article className="bg-white border border-clinic-line rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-lg bg-clinic-bg text-clinic-primary-deep flex items-center justify-center mb-4">
              <MortarIcon width={22} height={22} />
            </div>
            <h3 className="font-display font-bold text-lg text-clinic-primary-deep mb-2">
              จ่ายยาสมุนไพร
            </h3>
            <p className="text-clinic-ink-soft text-sm leading-relaxed">
              ปรุงยาสมุนไพรเฉพาะบุคคล โดยแพทย์แผนไทยผู้เชี่ยวชาญ
            </p>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-clinic-line bg-white" id="contact">
        <div className="max-w-6xl mx-auto px-6 py-9 flex flex-wrap justify-between gap-6 text-clinic-ink-soft text-sm">
          <div className="space-y-1">
            <strong className="block font-display text-base font-semibold text-clinic-primary-deep">
              พิมพ์วิมานคลินิกการแพทย์แผนไทย
            </strong>
            <p className="text-xs">123 ถ.สุขุมวิท ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200</p>
          </div>
          <div className="space-y-1">
            <strong className="block font-display text-base font-semibold text-clinic-primary-deep">
              เวลาทำการ
            </strong>
            <p className="text-xs">จันทร์ – เสาร์ 9:00 – 17:00 น.</p>
          </div>
          <div className="space-y-1">
            <strong className="block font-display text-base font-semibold text-clinic-primary-deep">
              ติดต่อ
            </strong>
            <p className="text-xs">095-123-4567</p>
          </div>
          <p className="w-full border-t border-clinic-line pt-5 mt-2 text-xs text-center text-clinic-ink-soft">
            © 2026 พิมพ์วิมานคลินิกการแพทย์แผนไทย
          </p>
        </div>
      </footer>
    </div>
  );
}