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
  Pill,
  Receipt,
  Star,
  HeartHandshake,
  FileDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatDoctorDisplayName } from "@/lib/utils";

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
        subtitle="บันทึกประวัติการตรวจรักษา คำแนะนำการปฏิบัติตัวจากแพทย์ รายการยาสมุนไพร และใบเสร็จรับเงิน"
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
            const receipt = treatment.receipt;

            return (
              <Card
                key={treatment.recordTreatmentId}
                className="hover:border-clinic-primary/40 hover:shadow-sm transition-all overflow-hidden"
              >
                {/* Treatment Header: Visit Date & Attending Doctor */}
                <CardHeader className="pb-3 border-b border-clinic-line bg-clinic-bg/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default" className="text-xs font-bold">
                        การรักษา #{treatment.recordTreatmentId}
                      </Badge>
                      {treatment.appointmentId && (
                        <span className="text-xs text-clinic-ink-soft">
                          นัดหมาย #{treatment.appointmentId}
                        </span>
                      )}
                      {treatment.ttmDiagnosis && (
                        <span className="text-xs bg-clinic-primary/10 text-clinic-primary-deep font-semibold px-2 py-0.5 rounded-full border border-clinic-primary/20">
                          {treatment.ttmDiagnosis}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-base text-clinic-primary-deep flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-clinic-primary shrink-0" />
                      <span>
                        {visitDate.toLocaleDateString("th-TH", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </h3>
                  </div>

                  <div className="text-left sm:text-right text-xs">
                    <p className="text-clinic-ink-soft">แพทย์ผู้ตรวจรักษา:</p>
                    <p className="font-bold text-sm text-clinic-primary-deep mt-0.5">
                      {formatDoctorDisplayName(treatment.doctorFullname)}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Section 1: Doctor's Advice & Suggestions */}
                  <div className="p-4 rounded-control bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                    <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>คำแนะนำและการปฏิบัติตัวจากแพทย์ (Doctor&apos;s Advice & Suggestions)</span>
                    </h4>
                    <p className="text-xs text-emerald-950 leading-relaxed pl-6">
                      {treatment.suggestions || "ไม่มีคำแนะนำเพิ่มเติมพิเศษ กรุณาปฏิบัติตามวิธีใช้ยาอย่างเคร่งครัด"}
                    </p>
                    {treatment.followup && (
                      <div className="pt-2 pl-6 text-xs text-emerald-900 font-medium flex items-center gap-1.5 border-t border-emerald-200/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>การติดตามอาการ: {treatment.followup}</span>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Prescribed Herbal Medicines Table */}
                  <div className="space-y-2.5">
                    <h4 className="font-bold text-xs text-clinic-primary-deep flex items-center gap-2">
                      <Pill className="w-4 h-4 text-clinic-terracotta shrink-0" />
                      <span>รายการยาสมุนไพรและวิธีรับประทาน (Prescribed Medicines & Instructions)</span>
                    </h4>

                    {medicines.length > 0 ? (
                      <div className="overflow-x-auto border border-clinic-line rounded-control shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-clinic-bg/80 text-clinic-ink-soft uppercase text-[10px] tracking-wider border-b border-clinic-line">
                            <tr>
                              <th className="px-3.5 py-2.5">ลำดับ</th>
                              <th className="px-3.5 py-2.5">รายการยา</th>
                              <th className="px-3.5 py-2.5">วิธีรับประทาน / คำแนะนำ</th>
                              <th className="px-3.5 py-2.5 text-center">จำนวน</th>
                              <th className="px-3.5 py-2.5 text-right">ราคา/หน่วย</th>
                              <th className="px-3.5 py-2.5 text-right">รวม (บาท)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-clinic-line bg-white">
                            {medicines.map((m, idx) => (
                              <tr key={m.recordTreatmentMedicineId} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3.5 py-2.5 text-clinic-ink-soft font-mono text-center w-12">
                                  {idx + 1}
                                </td>
                                <td className="px-3.5 py-2.5 font-bold text-clinic-ink">
                                  {m.medicineName}
                                </td>
                                <td className="px-3.5 py-2.5 text-clinic-ink-soft leading-relaxed max-w-xs">
                                  {m.note ? (
                                    <span className="text-clinic-ink font-medium">{m.note}</span>
                                  ) : (
                                    <span className="italic text-clinic-ink-muted">รับประทานตามที่แพทย์แนะนำ</span>
                                  )}
                                </td>
                                <td className="px-3.5 py-2.5 text-center font-mono font-semibold text-clinic-ink">
                                  {m.quantity} {m.unitType ? <span className="text-[11px] font-normal text-clinic-ink-soft">{m.unitType}</span> : ""}
                                </td>
                                <td className="px-3.5 py-2.5 text-right font-mono text-clinic-ink-soft">
                                  ฿{(m.priceAtTime ?? 0).toLocaleString()}
                                </td>
                                <td className="px-3.5 py-2.5 text-right font-mono font-bold text-clinic-primary">
                                  ฿{(m.subTotal ?? 0).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-clinic-ink-soft italic p-3 bg-clinic-bg/40 border border-clinic-line rounded-control text-center">
                        ไม่มีรายการจ่ายยาสมุนไพรสำหรับการรักษานี้
                      </p>
                    )}
                  </div>

                  {/* Section 3: Receipt Status, Fee Summary & Receipt Document Link */}
                  <div className="pt-3 border-t border-clinic-line">
                    {receipt ? (
                      <div className="p-4 rounded-control bg-slate-50/70 border border-clinic-line space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Receipt className="w-4 h-4 text-clinic-primary shrink-0" />
                            <span className="font-bold text-xs text-clinic-ink">
                              ใบเสร็จรับเงิน #{receipt.receiptId}
                            </span>
                            <PaymentStatusBadge status={receipt.paymentStatus} />
                            {receipt.paymentMethod && (
                              <span className="text-[11px] text-clinic-ink-soft font-mono">
                                ({receipt.paymentMethod})
                              </span>
                            )}
                          </div>

                          {/* Link to Receipt Document (PDF) */}
                          <a
                            href={`/api/receipts/record-treatment/${treatment.recordTreatmentId}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-white hover:bg-clinic-primary hover:text-white text-clinic-primary border border-clinic-primary/30 text-xs font-semibold shadow-2xs transition-all w-fit"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>ดูใบเสร็จรับเงิน (PDF)</span>
                          </a>
                        </div>

                        {/* Fee Summary Breakdown */}
                        <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-clinic-ink-soft">
                            {receipt.medicineTotal !== undefined && receipt.medicineTotal !== null && (
                              <span>
                                ค่ายาสมุนไพร: <strong className="font-mono text-clinic-ink">฿{receipt.medicineTotal.toLocaleString()}</strong>
                              </span>
                            )}
                            {receipt.additionalItems && receipt.additionalItems.length > 0 && (
                              <span>
                                ค่าบริการเพิ่มเติม:{" "}
                                <strong className="font-mono text-clinic-ink">
                                  ฿{receipt.additionalItems.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}
                                </strong>
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-clinic-ink-soft">ยอดชำระสุทธิ: </span>
                            <span className="font-mono font-bold text-sm text-clinic-primary-deep">
                              ฿{(receipt.totalPrice ?? 0).toLocaleString()} บาท
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 p-3 rounded-control bg-clinic-bg/40 border border-clinic-line text-xs">
                        <span className="text-clinic-ink-soft flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-clinic-ink-muted" />
                          <span>ยังไม่มีใบเสร็จรับเงินสำหรับการรักษานี้</span>
                        </span>
                        <Link
                          href="/patient/reviews"
                          className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>ให้คะแนน / รีวิวบริการ →</span>
                        </Link>
                      </div>
                    )}

                    {receipt && (
                      <div className="pt-2 flex justify-end">
                        <Link
                          href="/patient/reviews"
                          className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>ให้คะแนน / รีวิวบริการ →</span>
                        </Link>
                      </div>
                    )}
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
          description="เมื่อท่านเข้ารับการตรวจรักษาที่คลินิก ประวัติการตรวจ วินิจฉัย รายการยา และใบเสร็จรับเงินจะแสดงที่นี่"
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
