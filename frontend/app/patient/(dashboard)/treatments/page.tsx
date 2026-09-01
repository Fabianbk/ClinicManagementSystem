import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRecordTreatmentsByPatientId } from "@/lib/resources/record-treatments";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, PaymentStatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FileText,
  CalendarPlus,
  Activity,
  Heart,
  Pill,
  Receipt,
  User,
  Calendar,
  Star,
} from "lucide-react";

const SYMPTOM_CAUSE_MAP: Record<string, string> = {
  FOOD: "อาหาร (Food)",
  POSTURE: "อิริยาบถ (Position/Posture)",
  WEATHER: "ความร้อน-ความเย็น (Weather/Temperature)",
  FASTING_LACK_SLEEP: "อดนอน อดข้าว อดน้ำ (Fasting & lack of sleep)",
  SUPPRESS_URGES: "กลั้นอุจจาระปัสสาวะ (Incontinence)",
  OVEREXERTION: "ทำงานเกินกำลัง (Overexertion)",
  SADNESS: "ความเศร้าโศกเสียใจ (Sadness)",
  ANGER: "ความโกรธ (Wrath/Anger)",
  OTHER: "อื่นๆ (Other)",
};

export default async function PatientTreatmentsPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    redirect("/patient/login");
  }

  const treatmentsData = await getRecordTreatmentsByPatientId(session.id, 0, 50).catch(
    () => ({ content: [] })
  );

  const treatments = treatmentsData.content || [];

  return (
    <div className="space-y-6 pb-16 font-body text-clinic-ink">
      {/* Header */}
      <PageHeader
        icon={<FileText className="w-5 h-5 text-clinic-primary" />}
        title="ประวัติการรักษาและยา (Treatment History)"
        subtitle="บันทึกประวัติการตรวจรักษา คำวินิจฉัยทางการแพทย์แผนไทย และรายการยาสมุนไพรที่ได้รับ"
        actions={
          <Button asChild variant="terracotta" size="sm" className="gap-1.5 shadow-xs">
            <Link href="/patient/book">
              <CalendarPlus className="w-4 h-4" />
              <span>+ จองคิวนัดหมายใหม่</span>
            </Link>
          </Button>
        }
      />

      {/* Treatments List */}
      {treatments.length > 0 ? (
        <div className="space-y-6">
          {treatments.map((treatment) => {
            const visitDate = new Date(treatment.recordDate);
            const medicines = treatment.recordTreatmentMedicines || [];

            return (
              <Card
                key={treatment.recordTreatmentId}
                className="hover:border-clinic-primary/40 hover:shadow-sm transition-all"
              >
                {/* Treatment Header */}
                <CardHeader className="pb-3 border-b border-clinic-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs font-bold">
                        การรักษา #{treatment.recordTreatmentId}
                      </Badge>
                      <span className="text-xs text-clinic-ink-soft">
                        นัดหมาย #{treatment.appointmentId}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base text-clinic-primary-deep">
                      {visitDate.toLocaleDateString("th-TH", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right text-xs text-clinic-ink-soft">
                    <p>แพทย์ผู้ตรวจรักษา:</p>
                    <p className="font-semibold text-sm text-clinic-ink">พท. {treatment.doctorFullname}</p>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Clinical Notes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Symptoms & Vitals */}
                    <div className="bg-clinic-bg/50 rounded-control p-4 space-y-3 border border-clinic-line">
                      <h4 className="font-bold text-clinic-primary-deep flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-clinic-primary" />
                        <span>อาการและการตรวจร่างกาย</span>
                      </h4>
                      <p className="text-xs text-clinic-ink leading-relaxed">
                        <strong className="text-clinic-ink-soft">อาการ:</strong>{" "}
                        {treatment.symptoms || "-"}
                      </p>

                      {/* Vitals row */}
                      <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                        {treatment.temp && (
                          <span className="px-2 py-0.5 rounded bg-white border border-clinic-line">
                            อุณหภูมิ: {treatment.temp} °C
                          </span>
                        )}
                        {treatment.bp && (
                          <span className="px-2 py-0.5 rounded bg-white border border-clinic-line">
                            ความดัน: {treatment.bp}
                          </span>
                        )}
                        {treatment.pulse && (
                          <span className="px-2 py-0.5 rounded bg-white border border-clinic-line">
                            ชีพจร: {treatment.pulse} bpm
                          </span>
                        )}
                      </div>

                      {(treatment.bicepRt || treatment.kneeRt) && (
                        <p className="text-[11px] text-clinic-ink-soft pt-1 font-mono">
                          Reflexes: Bicep RT {treatment.bicepRt || "-"}/LT {treatment.bicepLt || "-"} · Knee RT {treatment.kneeRt || "-"}/LT {treatment.kneeLt || "-"}
                        </p>
                      )}
                    </div>

                    {/* Diagnoses & Treatment Plan */}
                    <div className="bg-clinic-bg/50 rounded-control p-4 space-y-3 border border-clinic-line">
                      <h4 className="font-bold text-clinic-primary-deep flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-clinic-terracotta" />
                        <span>การวินิจฉัยและแผนการรักษา</span>
                      </h4>
                      <div className="space-y-1.5">
                        {treatment.ttmDiagnosis && (
                          <p className="text-xs">
                            <strong className="text-clinic-primary">การวินิจฉัยแผนไทย:</strong>{" "}
                            <span className="text-clinic-ink font-semibold">{treatment.ttmDiagnosis}</span>
                          </p>
                        )}
                        {((treatment.causesOfSymptoms && treatment.causesOfSymptoms.length > 0) || treatment.causeOfSymptomsOther) && (
                          <div className="pt-1 space-y-1">
                            <span className="text-xs font-semibold text-clinic-ink-soft block">มูลเหตุเกิดโรค:</span>
                            <div className="flex flex-wrap gap-1">
                              {treatment.causesOfSymptoms?.map((cause) => (
                                <Badge key={cause} variant="outline" className="text-[10px] py-0 bg-white">
                                  {SYMPTOM_CAUSE_MAP[cause] || cause}
                                </Badge>
                              ))}
                            </div>
                            {treatment.causeOfSymptomsOther && (
                              <p className="text-[11px] text-clinic-ink-soft italic">
                                ({treatment.causeOfSymptomsOther})
                              </p>
                            )}
                          </div>
                        )}
                        {treatment.modernDiagnosis && (
                          <p className="text-xs">
                            <strong className="text-clinic-ink-soft">การวินิจฉัยแผนปัจจุบัน:</strong>{" "}
                            <span className="text-clinic-ink">{treatment.modernDiagnosis}</span>
                          </p>
                        )}
                        {treatment.suggestions && (
                          <p className="text-xs pt-1 text-clinic-ink-soft">
                            <strong className="text-clinic-ink">คำแนะนำ:</strong>{" "}
                            {treatment.suggestions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prescribed Medicines */}
                  {medicines.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-clinic-line">
                      <h4 className="font-bold text-xs text-clinic-primary-deep flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-clinic-terracotta" />
                        <span>ยาสมุนไพรและเวชภัณฑ์ที่ได้รับ</span>
                      </h4>
                      <div className="overflow-x-auto border border-clinic-line rounded-control">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-clinic-bg text-clinic-ink-soft uppercase text-[10px] tracking-wider border-b border-clinic-line">
                            <tr>
                              <th className="px-3.5 py-2">รายการยา</th>
                              <th className="px-3.5 py-2 text-center">จำนวน</th>
                              <th className="px-3.5 py-2 text-right">ราคา/หน่วย</th>
                              <th className="px-3.5 py-2 text-right">รวม (บาท)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-clinic-line bg-white">
                            {medicines.map((m) => (
                              <tr key={m.recordTreatmentMedicineId}>
                                <td className="px-3.5 py-2 font-semibold text-clinic-ink">
                                  {m.medicineName}
                                </td>
                                <td className="px-3.5 py-2 text-center font-mono">
                                  {m.quantity}
                                </td>
                                <td className="px-3.5 py-2 text-right font-mono">
                                  ฿{(m.priceAtTime ?? 0).toLocaleString()}
                                </td>
                                <td className="px-3.5 py-2 text-right font-mono font-bold text-clinic-primary">
                                  ฿{(m.subTotal ?? 0).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Receipt & Review Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-clinic-line text-xs">
                    {treatment.receipt ? (
                      <div className="flex items-center gap-2">
                        <Receipt className="w-3.5 h-3.5 text-clinic-primary" />
                        <span className="text-clinic-ink-soft">
                          ใบเสร็จรับเงิน #{treatment.receipt.receiptId} ·
                        </span>
                        <PaymentStatusBadge status={treatment.receipt.paymentStatus} />
                        <span className="font-bold text-xs text-clinic-primary-deep font-mono ml-1">
                          (฿{(treatment.receipt.totalPrice ?? 0).toLocaleString()} บาท)
                        </span>
                      </div>
                    ) : (
                      <span className="text-clinic-ink-soft text-[11px]">การตรวจรักษาเสร็จสมบูรณ์</span>
                    )}

                    <Link
                      href="/patient/reviews"
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>ให้คะแนน / รีวิวบริการ →</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-clinic-primary" />}
          title="ยังไม่มีประวัติการบันทึกการรักษา"
          description="เมื่อท่านเข้ารับการตรวจรักษาที่คลินิก ประวัติการตรวจ วินิจฉัย และรายการยาจะแสดงที่นี่"
          action={
            <Button asChild variant="terracotta" size="sm">
              <Link href="/patient/book">
                <CalendarPlus className="w-4 h-4 mr-1.5" />
                <span>+ จองคิวออนไลน์ตอนนี้</span>
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
