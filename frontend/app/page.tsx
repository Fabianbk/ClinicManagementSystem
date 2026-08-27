import { NavBar } from "@/components/site/NavBar";
import Link from "next/link";
import { getDoctors } from "@/lib/resources/doctors";
import { getWorkingSchedules } from "@/lib/resources/working-schedules";
import { getAllReviews } from "@/lib/resources/reviews";
import { PublicDoctorSchedule } from "@/components/site/PublicDoctorSchedule";
import { PublicReviewsSection } from "@/components/site/PublicReviewsSection";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Flame,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { LeafIcon, MortarIcon, LeafPattern } from "@/components/site/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [doctorsData, schedulesData, reviewsData] = await Promise.all([
    getDoctors(0, 100).catch(() => ({ content: [] })),
    getWorkingSchedules(0, 50).catch(() => ({ content: [] })),
    getAllReviews(0, 20).catch(() => ({ content: [] })),
  ]);

  const doctors = doctorsData.content || [];
  const schedules = schedulesData.content || [];
  const reviews = reviewsData.content || [];

  return (
    <div className="min-h-screen bg-clinic-bg text-clinic-ink flex flex-col justify-between font-body">
      <NavBar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-16 py-8 sm:py-14">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="terracotta" className="px-3 py-1 text-xs gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>การแพทย์แผนไทยประยุกต์และเวชระเบียน</span>
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display leading-[1.2] text-clinic-primary-deep font-bold tracking-tight">
              พิมพ์วิมานคลินิก
              <br />
              <span className="text-clinic-terracotta">การแพทย์แผนไทย</span>
            </h1>

            <p className="text-clinic-ink-soft text-sm sm:text-base leading-relaxed max-w-xl">
              บริการตรวจ วินิจฉัย และให้คำปรึกษาด้วยศาสตร์การแพทย์แผนไทย
              ประเมินสมดุลธาตุเจ้าเรือนกำเนิด (ดิน น้ำ ลม ไฟ)
              และสั่งจ่ายตำรับยาสมุนไพรไทยตามอาการเฉพาะบุคคล
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Button asChild variant="terracotta" size="lg" className="gap-2 shadow-sm font-semibold">
                <Link href="/patient/login">
                  <Calendar className="w-4 h-4" />
                  <span>จองคิวนัดหมายออนไลน์</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 bg-white">
                <a href="#schedule">
                  <Clock className="w-4 h-4 text-clinic-terracotta" />
                  <span>ดูตารางตรวจแพทย์</span>
                </a>
              </Button>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-clinic-line">
              <div className="space-y-0.5">
                <p className="font-display font-bold text-base text-clinic-primary">พท.ว. / พท.ภ.</p>
                <p className="text-xs text-clinic-ink-soft">แพทย์แผนไทยมีใบประกอบวิชาชีพ</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-display font-bold text-base text-clinic-terracotta">ธาตุเจ้าเรือน</p>
                <p className="text-xs text-clinic-ink-soft">วิเคราะห์สมดุล ดิน น้ำ ลม ไฟ</p>
              </div>
              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <p className="font-display font-bold text-base text-clinic-primary">Online Record</p>
                <p className="text-xs text-clinic-ink-soft">ระบบเวชระเบียนและติดตามผล</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-card overflow-hidden aspect-[4/3.6] bg-gradient-to-br from-clinic-primary-deep via-clinic-primary to-[#2C523D] shadow-xl p-6 flex flex-col justify-between group border border-white/10">
              <LeafPattern className="absolute inset-0 w-full h-full opacity-30 object-cover" />

              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                  พิมพ์วิมานคลินิกการแพทย์แผนไทย
                </span>
                <ShieldCheck className="w-6 h-6 text-clinic-terracotta-soft opacity-90" />
              </div>

              <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-control p-4 flex items-center gap-3.5 shadow-lg border border-white/30">
                <div className="shrink-0 w-10 h-10 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center">
                  <LeafIcon width={22} height={22} />
                </div>
                <div>
                  <strong className="block text-sm font-semibold text-clinic-ink">
                    คลินิกการแพทย์แผนไทย
                  </strong>
                  <span className="block text-xs text-clinic-ink-soft">
                    ให้บริการตรวจวินิจฉัยและสั่งจ่ายตำรับยาสมุนไพร
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="space-y-6 pt-4">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <h2 className="font-display text-2xl font-bold text-clinic-primary-deep">
              บริการและการตรวจรักษาทางการแพทย์แผนไทย
            </h2>
            <p className="text-xs text-clinic-ink-soft">
              การตรวจวินิจฉัยและดูแลสุขภาพตามแนวทางคัมภีร์การแพทย์แผนไทย
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white hover:border-clinic-primary/40 hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center mb-2 shadow-2xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-clinic-primary-deep">
                  ตรวจวินิจฉัยโรคทางการแพทย์แผนไทย
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-clinic-ink-soft leading-relaxed">
                  ตรวจประเมินร่างกาย ซักประวัติอาการ และวินิจฉัยตามคัมภีร์เวชกรรมไทย
                  เพื่อหาสาเหตุและสมมุติฐานของโรค
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:border-clinic-primary/40 hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-control bg-clinic-terracotta-soft text-clinic-terracotta-deep flex items-center justify-center mb-2 shadow-2xs">
                  <HeartPulse className="w-5 h-5 text-clinic-terracotta" />
                </div>
                <CardTitle className="text-base font-bold text-clinic-primary-deep">
                  วิเคราะห์ธาตุเจ้าเรือนกำเนิด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-clinic-ink-soft leading-relaxed">
                  คำนวณและประเมินสภาวะสมดุลธาตุหลักและธาตุรอง (ดิน น้ำ ลม ไฟ)
                  พร้อมให้คำแนะนำการปฏิบัติตัวเพื่อส่งเสริมสุขภาพ
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:border-clinic-primary/40 hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center mb-2 shadow-2xs">
                  <MortarIcon width={22} height={22} />
                </div>
                <CardTitle className="text-base font-bold text-clinic-primary-deep">
                  สั่งจ่ายตำรับยาสมุนไพรไทยเฉพาะบุคคล
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-clinic-ink-soft leading-relaxed">
                  สั่งจ่ายตำรับยาสมุนไพรที่ถูกต้องตามหลักเภสัชกรรมไทย
                  สอดคล้องกับผลการตรวจวินิจฉัยและอาการของผู้ป่วยแต่ละท่าน
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Doctor Schedule Section (SRS UC 3.1.1 View Doctor Schedule) */}
        <section id="schedule" className="space-y-6 pt-4">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <Badge variant="outline" className="text-xs text-clinic-primary border-clinic-primary/30">
              ตารางเวลาการออกตรวจ (Working Schedules)
            </Badge>
            <h2 className="font-display text-2xl font-bold text-clinic-primary-deep">
              ตารางเวลาออกตรวจของแพทย์
            </h2>
            <p className="text-xs text-clinic-ink-soft">
              ตรวจสอบวัน เวลาออกตรวจ และรอบเวลาที่เปิดรับนัดหมายของแพทย์แผนไทยประจำคลินิก
            </p>
          </div>

          <PublicDoctorSchedule initialSchedules={schedules} initialDoctors={doctors} />
        </section>

        {/* Patient Reviews Section */}
        <section id="reviews" className="space-y-6 pt-4">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <Badge variant="outline" className="text-xs text-clinic-terracotta border-clinic-terracotta/30">
              ข้อคิดเห็นและเสียงตอบรับ (Patient Reviews)
            </Badge>
            <h2 className="font-display text-2xl font-bold text-clinic-primary-deep">
              รีวิวและความพึงพอใจจากผู้รับบริการ
            </h2>
            <p className="text-xs text-clinic-ink-soft">
              ความประทับใจและผลลัพธ์การตรวจรักษาจากผู้ป่วยของพิมพ์วิมานคลินิก
            </p>
          </div>

          <PublicReviewsSection initialReviews={reviews} />
        </section>

        {/* Contact & Location Section */}
        <section id="contact" className="space-y-6 pt-4 border-t border-clinic-line">
          <div className="bg-white rounded-card border border-clinic-line p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-clinic-primary-deep">
                    พิมพ์วิมานคลินิกการแพทย์แผนไทย
                  </h3>
                  <p className="text-xs text-clinic-ink-soft mt-1">
                    สถานที่ให้บริการตรวจวินิจฉัยและดูแลสุขภาพด้วยศาสตร์การแพทย์แผนไทย
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-clinic-ink">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-clinic-terracotta shrink-0 mt-0.5" />
                    <span>อาคารพิมพ์วิมาน ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-clinic-primary shrink-0" />
                    <span>วันและเวลาทำการ: วันจันทร์ - วันเสาร์ เวลา 09:00 - 18:00 น. (หยุดวันอาทิตย์)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-clinic-primary shrink-0" />
                    <span className="font-mono">โทรศัพท์: 02-xxx-xxxx / 08x-xxx-xxxx</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-5 bg-clinic-bg/60 rounded-control border border-clinic-line space-y-4">
                <div>
                  <h4 className="font-bold text-xs text-clinic-primary-deep mb-1">
                    นัดหมายเข้ารับการตรวจรักษา
                  </h4>
                  <p className="text-xs text-clinic-ink-soft leading-relaxed">
                    ผู้รับบริการสามารถตรวจสอบตารางเวรแพทย์และจองคิวออนไลน์ล่วงหน้าผ่านระบบได้ตลอด 24 ชั่วโมง
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Button asChild variant="terracotta" size="sm" className="font-semibold gap-1.5 shadow-2xs">
                    <Link href="/patient/login">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>เข้าสู่ระบบจองคิว</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="bg-white">
                    <Link href="/doctor/login">
                      <span>เข้าสู่ระบบสำหรับแพทย์</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-clinic-line bg-white py-6 text-center text-xs text-clinic-ink-soft">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} พิมพ์วิมานคลินิกการแพทย์แผนไทย. สงวนลิขสิทธิ์.</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="#services" className="hover:text-clinic-primary-deep">บริการ</a>
            <a href="#schedule" className="hover:text-clinic-primary-deep">ตารางตรวจแพทย์</a>
            <a href="#reviews" className="hover:text-clinic-primary-deep">รีวิว</a>
            <Link href="/patient/login" className="hover:text-clinic-primary-deep">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}