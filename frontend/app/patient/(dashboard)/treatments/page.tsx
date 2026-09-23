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
  Sparkles,
  Printer,
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
            const additionalItems = receipt?.additionalItems || [];
            const additionalItemsTotal = additionalItems.reduce(
              (sum, item) => sum + (item.amount || 0),
              0
            );

            return (
              <Card
                key={treatment.recordTreatmentId}
                className="hover:border-clinic-primary/40 hover:shadow-sm transition-all overflow-hidden"
              >
                {/* Treatment Header: Visit Date & Attending Doctor */}
                <CardHeader className="pb-3 border-b border-clinic-line bg-clinic-bg/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs bg-clinic-primary/10 text-clinic-primary border-clinic-primary/30 font-medium">
                        บันทึกการรักษา
                      </Badge>
                      {receipt && (
                        <PaymentStatusBadge status={receipt.paymentStatus} />
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
                              <th className="px-3.5 py-2.5 text-center w-12">ลำดับ</th>
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
                                <td className="px-3.5 py-2.5 text-clinic-ink-soft font-mono text-center">
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

                  {/* Section 3: Additional Services & Procedures */}
                  {additionalItems.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="font-bold text-xs text-clinic-primary-deep flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-clinic-primary shrink-0" />
                        <span>รายการบริการและการรักษาเพิ่มเติม (Additional Services & Treatments)</span>
                      </h4>

                      <div className="overflow-x-auto border border-clinic-line rounded-control shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-clinic-bg/80 text-clinic-ink-soft uppercase text-[10px] tracking-wider border-b border-clinic-line">
                            <tr>
                              <th className="px-3.5 py-2.5 text-center w-12">ลำดับ</th>
                              <th className="px-3.5 py-2.5">รายการบริการ / การรักษา</th>
                              <th className="px-3.5 py-2.5 text-center">จำนวน</th>
                              <th className="px-3.5 py-2.5 text-right">จำนวนเงิน (บาท)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-clinic-line bg-white">
                            {additionalItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3.5 py-2.5 text-clinic-ink-soft font-mono text-center">
                                  {idx + 1}
                                </td>
                                <td className="px-3.5 py-2.5 font-bold text-clinic-ink">
                                  {item.itemName}
                                </td>
                                <td className="px-3.5 py-2.5 text-center text-clinic-ink-soft">
                                  1 รายการ
                                </td>
                                <td className="px-3.5 py-2.5 text-right font-mono font-bold text-clinic-primary">
                                  ฿{(item.amount ?? 0).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Section 4: Receipt Status, Fee Summary & Receipt Document Link */}
                  <div className="pt-3 border-t border-clinic-line">
                    {receipt ? (
                      <div className="p-4 rounded-control bg-slate-50/70 border border-clinic-line space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Receipt className="w-4 h-4 text-clinic-primary shrink-0" />
                            <span className="font-bold text-xs text-clinic-ink">
                              เอกสารใบเสร็จรับเงิน
                            </span>
                            <PaymentStatusBadge status={receipt.paymentStatus} />
                            {receipt.paymentMethod && (
                              <span className="text-[11px] text-clinic-ink-soft">
                                ({receipt.paymentMethod === "CASH" ? "ชำระด้วยเงินสด" : receipt.paymentMethod === "TRANSFER" ? "ชำระด้วยการโอนเงิน" : receipt.paymentMethod})
                              </span>
                            )}
                          </div>

                          {/* Link to Receipt / Treatment Order Document */}
                          <a
                            href={`/print/treatment-order/${treatment.recordTreatmentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-white hover:bg-clinic-primary hover:text-white text-clinic-primary border border-clinic-primary/30 text-xs font-semibold shadow-2xs transition-all w-fit"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>ดูใบเสร็จ / ใบสั่งการรักษา (A4)</span>
                          </a>
                        </div>

                        {/* Fee Summary Breakdown */}
                        <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-clinic-ink-soft">
                            {receipt.medicineTotal !== undefined && receipt.medicineTotal !== null && (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-block w-2 h-2 rounded-full bg-clinic-terracotta"></span>
                                <span>ค่ายาสมุนไพร:</span>
                                <strong className="font-mono text-clinic-ink font-bold">฿{receipt.medicineTotal.toLocaleString()}</strong>
                              </div>
                            )}
                            {additionalItems.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-block w-2 h-2 rounded-full bg-clinic-primary"></span>
                                <span>ค่าบริการเพิ่มเติม ({additionalItems.length} รายการ):</span>
                                <strong className="font-mono text-clinic-ink font-bold">
                                  ฿{additionalItemsTotal.toLocaleString()}
                                </strong>
                              </div>
                            )}
                          </div>

                          <div className="text-right sm:text-right bg-white sm:bg-transparent px-3 py-1.5 sm:p-0 rounded border sm:border-0 border-slate-200">
                            <span className="text-xs text-clinic-ink-soft">ยอดชำระสุทธิ: </span>
                            <span className="font-mono font-bold text-base text-clinic-primary-deep">
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
          description="เมื่อท่านเข้ารับการตรวจรักษาที่คลินิก คำแนะนำจากแพทย์ รายการยาสมุนไพร และใบเสร็จรับเงินจะแสดงที่นี่"
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
