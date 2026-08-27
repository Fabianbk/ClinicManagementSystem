import { NavBar } from "@/components/site/NavBar";
import Link from "next/link";
import { getDoctors } from "@/lib/resources/doctors";
import { getWorkingSchedules } from "@/lib/resources/working-schedules";
import { getAllReviews } from "@/lib/resources/reviews";
import { PublicDoctorSchedule } from "@/components/site/PublicDoctorSchedule";
import { PublicReviewsSection } from "@/components/site/PublicReviewsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { LeafIcon, LeafPattern } from "@/components/site/icons";

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

            {/* Action Buttons (Call Doctor prioritized) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button asChild variant="terracotta" size="lg" className="gap-2 shadow-sm font-semibold text-xs sm:text-sm">
                <a href="tel:0819358026">
                  <PhoneCall className="w-4 h-4" />
                  <span className="font-mono font-bold">โทร 081-935-8026 (ติดต่อแพทย์)</span>
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 bg-white border-clinic-line text-clinic-ink hover:border-clinic-primary hover:bg-clinic-primary-soft text-xs sm:text-sm">
                <Link href="/patient/login">
                  <Calendar className="w-4 h-4 text-clinic-primary" />
                  <span>จองคิวออนไลน์ (สำหรับคนไข้เดิม)</span>
                </Link>
              </Button>
            </div>

            {/* First-time patient guidance banner */}
            <div className="p-3.5 rounded-control bg-amber-50/90 border border-amber-200 text-amber-950 flex items-start gap-2.5 shadow-2xs">
              <Info className="w-4 h-4 text-clinic-terracotta shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold block text-clinic-primary-deep">
                  คำแนะนำสำหรับการเข้ารับการรักษา:
                </span>
                <p className="text-clinic-ink leading-relaxed text-[11px]">
                  ระบบจองคิวออนไลน์เปิดสำหรับผู้รับบริการเดิมที่มีประวัติในคลินิกแล้ว{" "}
                  <strong>หากท่านมารับการรักษาเป็นครั้งแรก</strong> แนะนำให้โทรสอบถามและปรึกษาแพทย์ก่อนที่เบอร์{" "}
                  <a href="tel:0819358026" className="font-bold text-clinic-terracotta underline font-mono text-xs">
                    081-935-8026
                  </a>
                </p>
              </div>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-clinic-line">
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

        {/* Doctor Schedule Section (SRS UC 3.1.1 View Doctor Schedule) */}
        <section id="schedule" className="space-y-6 pt-4">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <Badge variant="outline" className="text-xs text-clinic-primary border-clinic-primary/30">
              ปฏิทินเวลาทำงาน (Working Schedules)
            </Badge>
            <h2 className="font-display text-2xl font-bold text-clinic-primary-deep">
              เวลาทำงานของแพทย์
            </h2>
            <p className="text-xs text-clinic-ink-soft">
              ตรวจสอบปฏิทินวันทำงาน เวลาปฏิบัติงาน และรอบเวลาตรวจของแพทย์แผนไทยประจำคลินิก
            </p>
          </div>

          <PublicDoctorSchedule initialSchedules={schedules} initialDoctors={doctors} />
        </section>

        {/* Patient Reviews Section (Top 3 Preview + Link to all reviews) */}
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

          <PublicReviewsSection
            initialReviews={reviews}
            maxDisplay={3}
            showViewAllLink={true}
          />
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
                    <span>304/5 หมู่ 8 (ตลาดวันพุธ) ตำบลเวียงใต้ อำเภอปาย จังหวัดแม่ฮ่องสอน 58130</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-clinic-primary shrink-0" />
                    <span>วันและเวลาทำการ: วันจันทร์ - วันเสาร์ เวลา 09:00 – 19:00 น. (ปิดทำการวันอาทิตย์)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-clinic-terracotta shrink-0" />
                    <span className="font-mono">
                      โทรศัพท์:{" "}
                      <a href="tel:0819358026" className="font-bold text-clinic-terracotta underline">
                        081-935-8026
                      </a>{" "}
                      (ติดต่อและปรึกษาแพทย์)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-5 bg-clinic-bg/60 rounded-control border border-clinic-line space-y-4">
                <div>
                  <h4 className="font-bold text-xs text-clinic-primary-deep mb-1">
                    นัดหมายเข้ารับการตรวจรักษา
                  </h4>
                  <p className="text-xs text-clinic-ink-soft leading-relaxed">
                    สำหรับผู้รับบริการครั้งแรก กรุณาโทรติดต่อปรึกษาแพทย์ก่อนที่เบอร์{" "}
                    <a href="tel:0819358026" className="font-bold text-clinic-terracotta underline font-mono">
                      081-935-8026
                    </a>{" "}
                    (ผู้รับบริการเดิมที่มีประวัติในระบบสามารถจองคิวออนไลน์ได้ทันที)
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Button asChild variant="terracotta" size="sm" className="font-semibold gap-1.5 shadow-2xs">
                    <a href="tel:0819358026">
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      <span>โทรปรึกษาแพทย์ 081-935-8026</span>
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="bg-white">
                    <Link href="/patient/login">
                      <Calendar className="w-3.5 h-3.5 text-clinic-primary mr-1" />
                      <span>เข้าสู่ระบบจองคิว (คนไข้เดิม)</span>
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
            <Link href="/" className="hover:text-clinic-primary-deep">หน้าหลัก</Link>
            <Link href="/#schedule" className="hover:text-clinic-primary-deep">เวลาทำงานของแพทย์</Link>
            <Link href="/reviews" className="hover:text-clinic-primary-deep">รีวิวทั้งหมด</Link>
            <Link href="/patient/login" className="hover:text-clinic-primary-deep">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}