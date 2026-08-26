import { NavBar } from "@/components/site/NavBar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Phone,
  Sparkles,
  HeartPulse,
  Flame,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  LeafIcon,
  HandsIcon,
  MortarIcon,
  LeafPattern,
} from "@/components/site/icons";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-clinic-bg text-clinic-ink flex flex-col justify-between">
      <NavBar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-16 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="terracotta" className="px-3 py-1 text-xs gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ศาสตร์การแพทย์แผนไทยประยุกต์ & เรือนปรุงยาสมุนไพร</span>
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display leading-[1.2] text-clinic-primary-deep font-bold tracking-tight">
              ฟื้นฟูสุขภาพแบบองค์รวม
              <br />
              ด้วย<span className="text-clinic-terracotta">ตำรับยาสมุนไพรไทยแท้</span>
            </h1>

            <p className="text-clinic-ink-soft text-sm sm:text-base leading-relaxed max-w-xl">
              พิมพ์วิมานคลินิกให้บริการตรวจวินิจฉัยและรักษาอาการด้วยศาสตร์การแพทย์แผนไทย
              ประเมินธาตุเจ้าเรือน นวดบำบัดรักษา ประคบสมุนไพร และจ่ายยาสมุนไพรปรุงเฉพาะบุคคล
              อบอุ่น ปลอดภัย ใส่ใจทุกรายละเอียด
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Button asChild variant="terracotta" size="lg" className="gap-2 shadow-sm font-semibold">
                <Link href="/patient/login">
                  <Calendar className="w-4 h-4" />
                  <span>จองคิวนัดหมายออนไลน์</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 bg-white">
                <a href="#contact">
                  <Phone className="w-4 h-4 text-clinic-terracotta" />
                  <span>ติดต่อคลินิก</span>
                </a>
              </Button>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-clinic-line">
              <div className="space-y-0.5">
                <p className="font-display font-bold text-lg text-clinic-primary">พท.ว. / พท.ภ.</p>
                <p className="text-[11px] text-clinic-ink-soft">แพทย์แผนไทยมีใบประกอบ</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-display font-bold text-lg text-clinic-terracotta">100%</p>
                <p className="text-[11px] text-clinic-ink-soft">ยาสมุนไพรคัดเกรดสะอาด</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-display font-bold text-lg text-clinic-primary">Holistic</p>
                <p className="text-[11px] text-clinic-ink-soft">ดูแลตรงตามธาตุเจ้าเรือน</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-card overflow-hidden aspect-[4/3.6] bg-gradient-to-br from-clinic-primary-deep via-clinic-primary to-[#2C523D] shadow-xl p-6 flex flex-col justify-between group border border-white/10">
              <LeafPattern className="absolute inset-0 w-full h-full opacity-30 object-cover" />
              
              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                  เรือนยาพิมพ์วิมาน
                </span>
                <ShieldCheck className="w-6 h-6 text-clinic-terracotta-soft opacity-80" />
              </div>

              <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-control p-4 flex items-center gap-3.5 shadow-lg border border-white/30">
                <div className="shrink-0 w-10 h-10 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center">
                  <LeafIcon width={22} height={22} />
                </div>
                <div>
                  <strong className="block text-sm font-semibold text-clinic-ink">
                    พิมพ์วิมานคลินิกการแพทย์แผนไทย
                  </strong>
                  <span className="block text-xs text-clinic-ink-soft">
                    ให้บริการตรวจรักษาและจ่ายยาสมุนไพรมาตรฐาน
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="space-y-6">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <h2 className="font-display text-2xl font-bold text-clinic-primary-deep">
              บริการและการรักษาทางการแพทย์แผนไทย
            </h2>
            <p className="text-xs text-clinic-ink-soft">
              ตรวจ วินิจฉัย และฟื้นฟูสุขภาพด้วยศาสตร์สมุนไพรและหัตถการไทยโบราณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:border-clinic-primary/40 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center mb-2 shadow-2xs">
                  <HandsIcon width={22} height={22} />
                </div>
                <CardTitle>นวดแผนไทย & หัตถการบำบัด</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-clinic-ink-soft leading-relaxed">
                  คลายกล้ามเนื้อ แก้อาการปวดเมื่อยสะสม และปรับสมดุลทางกายวิภาคด้วยศาสตร์การนวดรักษาแผนไทยดั้งเดิม
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-clinic-primary/40 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-control bg-clinic-terracotta-soft text-clinic-terracotta-deep flex items-center justify-center mb-2 shadow-2xs">
                  <Flame className="w-5 h-5 text-clinic-terracotta" />
                </div>
                <CardTitle>ประคบสมุนไพรสด & แห้ง</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-clinic-ink-soft leading-relaxed">
                  กระตุ้นการไหลเวียนโลหิต ลดการอักเสบของกล้ามเนื้อและเอ็นด้วยลูกประคบสมุนไพรสูตรเฉพาะของเรือนยา
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-clinic-primary/40 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center mb-2 shadow-2xs">
                  <MortarIcon width={22} height={22} />
                </div>
                <CardTitle>ตรวจธาตุเจ้าเรือน & จ่ายยาสมุนไพร</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-clinic-ink-soft leading-relaxed">
                  วิเคราะห์สมดุลธาตุ ดิน น้ำ ลม ไฟ พร้อมจ่ายตำรับยาสมุนไพรไทยแท้ที่สะอาด ปลอดภัย และตรงตามอาการ
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-clinic-line bg-white mt-12" id="contact">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap justify-between gap-6 text-clinic-ink-soft text-xs">
          <div className="space-y-1.5 max-w-xs">
            <strong className="block font-display text-sm font-bold text-clinic-primary-deep">
              พิมพ์วิมาน · คลินิกการแพทย์แผนไทย
            </strong>
            <p className="text-[11px] leading-relaxed flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-clinic-terracotta mt-0.5" />
              <span>123 ถ.สุเทพ อ.เมือง จ.เชียงใหม่ 50200</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <strong className="block font-display text-sm font-bold text-clinic-primary-deep flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-clinic-primary" />
              <span>เวลาทำการ</span>
            </strong>
            <p className="text-[11px]">เปิดบริการ: วันจันทร์ – วันเสาร์</p>
            <p className="text-[11px] font-semibold text-clinic-ink">09:00 – 18:00 น. (หยุดวันอาทิตย์)</p>
          </div>

          <div className="space-y-1.5">
            <strong className="block font-display text-sm font-bold text-clinic-primary-deep flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-clinic-primary" />
              <span>ติดต่อสอบถาม</span>
            </strong>
            <p className="text-[11px]">โทรศัพท์: <span className="font-mono text-clinic-ink font-semibold">095-123-4567</span></p>
            <p className="text-[11px]">LINE: <span className="font-mono text-clinic-ink">@pimwiman-clinic</span></p>
          </div>

          <div className="w-full border-t border-clinic-line/80 pt-4 mt-2 text-[11px] text-center text-clinic-ink-muted">
            © 2026 พิมพ์วิมานคลินิกการแพทย์แผนไทยประยุกต์ · All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}