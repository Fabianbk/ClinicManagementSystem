import { NavBar } from "@/components/site/NavBar";
import Link from "next/link";
import Image from "next/image";
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
  ExternalLink,
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
            <div className="relative rounded-card overflow-hidden bg-gradient-to-br from-clinic-primary-deep via-clinic-primary to-[#1f3f2d] shadow-xl p-6 sm:p-7 flex flex-col justify-between group border border-white/10 min-h-[380px]">
              <LeafPattern className="absolute inset-0 w-full h-full opacity-20 object-cover" />

              <div className="relative z-10 flex justify-between items-start">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-xs">
                  พิมพ์วิมานคลินิกการแพทย์แผนไทย
                </span>
                <ShieldCheck className="w-6 h-6 text-clinic-terracotta-soft opacity-90" />
              </div>

              {/* Official Logo Display */}
              <div className="relative z-10 flex flex-col items-center justify-center my-5 sm:my-6">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-2 bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-white shadow-inner flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="ตราสัญลักษณ์ พิมพ์วิมานคลินิกการแพทย์แผนไทย"
                      fill
                      sizes="(max-width: 768px) 144px, 176px"
                      className="object-contain p-1.5"
                      priority
                    />
                  </div>
                </div>
                <p className="mt-3 text-white/90 text-xs sm:text-sm font-display font-medium tracking-wide text-center drop-shadow-xs">
                  Pimvimaan Thai Traditional Medical Clinic
                </p>
              </div>

              <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-control p-3.5 sm:p-4 flex items-center gap-3.5 shadow-lg border border-white/30">
                <div className="shrink-0 w-10 h-10 rounded-control bg-clinic-primary-soft text-clinic-primary flex items-center justify-center">
                  <LeafIcon width={22} height={22} />
                </div>
                <div>
                  <strong className="block text-sm font-semibold text-clinic-ink">
                    คลินิกการแพทย์แผนไทย
                  </strong>
                  <span className="block text-xs text-clinic-ink-soft">
                    ให้บริการตรวจวินิจฉัยและสั่งจ่ายตำรับยาสมุนไพรเฉพาะบุคคล
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
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <Badge variant="outline" className="text-xs text-clinic-primary border-clinic-primary/30">
              แผนที่และข้อมูลการติดต่อ (Location & Contact)
            </Badge>
            <h2 className="font-display text-2xl font-bold text-clinic-primary-deep">
              สถานที่ตั้งและการเดินทาง
            </h2>
            <p className="text-xs text-clinic-ink-soft">
              พิมพ์วิมานคลินิกการแพทย์แผนไทย ตั้งอยู่ใจกลางอำเภอปาย จังหวัดแม่ฮ่องสอน
            </p>
          </div>

          <div className="bg-white rounded-card border border-clinic-line p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Clinic Contact Details */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-clinic-primary/20 shadow-xs shrink-0 bg-white">
                      <Image
                        src="/logo.png"
                        alt="พิมพ์วิมานคลินิก"
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-clinic-primary-deep">
                        พิมพ์วิมานคลินิกการแพทย์แผนไทย
                      </h3>
                      <p className="text-xs text-clinic-terracotta font-medium">
                        Pimvimaan Thai Traditional Medical Clinic
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-clinic-ink pt-1">
                    <div className="flex items-start gap-3 p-3 rounded-control bg-clinic-bg/70 border border-clinic-line">
                      <MapPin className="w-5 h-5 text-clinic-terracotta shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="block text-clinic-primary-deep font-semibold">ที่อยู่คลินิก:</strong>
                        <span className="leading-relaxed">
                          304/5 หมู่ 8 (ตลาดวันพุธ) ตำบลเวียงใต้ อำเภอปาย จังหวัดแม่ฮ่องสอน 58130
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-control bg-clinic-bg/70 border border-clinic-line">
                      <Clock className="w-5 h-5 text-clinic-primary shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="block text-clinic-primary-deep font-semibold">วันและเวลาทำการ:</strong>
                        <span>วันจันทร์ – วันเสาร์: 09:00 – 19:00 น.</span>
                        <span className="block text-clinic-terracotta text-[11px] font-medium">(ปิดทำการทุกวันอาทิตย์)</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-control bg-clinic-bg/70 border border-clinic-line">
                      <PhoneCall className="w-5 h-5 text-clinic-terracotta shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="block text-clinic-primary-deep font-semibold">ติดต่อสอบถาม & ปรึกษาแพทย์:</strong>
                        <a
                          href="tel:0819358026"
                          className="font-mono text-sm font-bold text-clinic-terracotta hover:underline block"
                        >
                          081-935-8026
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/80 rounded-control border border-amber-200 text-amber-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-clinic-terracotta shrink-0" />
                    <strong className="text-xs font-bold text-clinic-primary-deep">
                      คำแนะนำสำหรับคนไข้ใหม่
                    </strong>
                  </div>
                  <p className="text-[11px] text-clinic-ink leading-relaxed">
                    กรณีมารับการรักษาเป็นครั้งแรก แนะนำให้โทรสอบถามหรือปรึกษาแพทย์ล่วงหน้าก่อนเดินทางมายังคลินิก
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button asChild variant="terracotta" size="sm" className="font-semibold gap-1.5 shadow-2xs text-xs">
                      <a href="tel:0819358026">
                        <Phone className="w-3.5 h-3.5 mr-0.5" />
                        <span>โทรปรึกษาแพทย์</span>
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="bg-white text-xs gap-1.5 hover:bg-clinic-primary-soft">
                      <a
                        href="https://maps.google.com/?q=19.3505488,98.437295"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-clinic-primary" />
                        <span>เปิดใน Google Maps</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Embedded Google Maps */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="w-full h-full min-h-[380px] sm:min-h-[460px] rounded-2xl overflow-hidden border border-clinic-line shadow-sm relative bg-slate-100">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3764.4294530534808!2d98.43729507521225!3d19.35054888191139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da81007759c621%3A0xecec0de732cc270e!2z4Lie4Li04Lih4Lie4LmM4Lin4Li04Lih4Liy4LiZ4LiE4Lil4Li04LiZ4Li04LiB4LiB4Liy4Lij4LmB4Lie4LiX4Lii4LmM4LmB4Lic4LiZ4LmE4LiX4LiiIFBpbXZpbWFhbiBUaGFpIFRyYWRpdGlvbmFsIE1lZGljYWwgQ2xpbmlj!5e0!3m2!1sen!2sth!4v1788339921696!5m2!1sen!2sth"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "380px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="แผนที่ พิมพ์วิมานคลินิกการแพทย์แผนไทย"
                    className="w-full h-full min-h-[380px] sm:min-h-[460px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-clinic-line bg-white py-6 text-xs text-clinic-ink-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-clinic-line bg-white shrink-0 shadow-2xs">
              <Image
                src="/logo.png"
                alt="พิมพ์วิมานคลินิก"
                width={28}
                height={28}
                className="object-cover w-full h-full"
              />
            </div>
            <p>© {new Date().getFullYear()} พิมพ์วิมานคลินิกการแพทย์แผนไทย. สงวนลิขสิทธิ์.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-clinic-primary-deep">หน้าหลัก</Link>
            <Link href="/#schedule" className="hover:text-clinic-primary-deep">เวลาทำงานของแพทย์</Link>
            <Link href="/reviews" className="hover:text-clinic-primary-deep">รีวิวทั้งหมด</Link>
            <Link href="/#contact" className="hover:text-clinic-primary-deep">แผนที่และติดต่อ</Link>
            <Link href="/patient/login" className="hover:text-clinic-primary-deep">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}