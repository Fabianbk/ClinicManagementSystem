import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRecordTreatmentsByPatientId } from "@/lib/resources/record-treatments";
import { LeafIcon, CalendarIcon } from "@/components/site/icons";

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
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-clinic-line rounded-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-clinic-primary-deep flex items-center gap-2">
            ประวัติการรักษาและยา
          </h1>
          <p className="text-xs text-clinic-ink-soft mt-0.5">
            บันทึกประวัติการตรวจรักษา คำวินิจฉัยทางการแพทย์แผนไทย และยาสมุนไพรที่ได้รับ
          </p>
        </div>

        <Link
          href="/patient/book"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-control font-semibold text-sm bg-clinic-primary hover:bg-clinic-primary-deep text-white transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
        >
          <CalendarIcon width={18} height={18} />
          <span>+ จองคิวนัดหมายใหม่</span>
        </Link>
      </div>

      {/* Treatments List */}
      {treatments.length > 0 ? (
        <div className="space-y-6">
          {treatments.map((treatment) => {
            const visitDate = new Date(treatment.recordDate);
            const medicines = treatment.recordTreatmentMedicines || [];

            return (
              <div
                key={treatment.recordTreatmentId}
                className="bg-white border border-clinic-line rounded-card p-6 shadow-sm space-y-5 hover:border-clinic-primary/40 transition-all"
              >
                {/* Treatment Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-clinic-line pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-clinic-primary/10 text-clinic-primary border border-clinic-primary/20">
                        การรักษา #{treatment.recordTreatmentId}
                      </span>
                      <span className="text-xs text-clinic-ink-soft">
                        นัดหมาย #{treatment.appointmentId}
                      </span>
                    </div>
                    <p className="font-display font-bold text-lg text-clinic-primary-deep">
                      {visitDate.toLocaleDateString("th-TH", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right text-xs text-clinic-ink-soft">
                    <p>แพทย์ผู้ตรวจ:</p>
                    <p className="font-semibold text-sm text-clinic-ink">{treatment.doctorFullname}</p>
                  </div>
                </div>

                {/* Clinical Notes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Symptoms & Vitals */}
                  <div className="bg-clinic-bg rounded-control p-4 space-y-3 border border-clinic-line">
                    <h4 className="font-bold text-clinic-primary-deep flex items-center gap-1.5">
                      <span>🩺 อาการและการตรวจร่างกาย</span>
                    </h4>
                    <p className="text-sm text-clinic-ink leading-relaxed">
                      <span className="font-semibold text-clinic-ink-soft">อาการ:</span>{" "}
                      {treatment.symptoms || "-"}
                    </p>

                    {/* Vitals badge row */}
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
                  </div>

                  {/* Diagnoses & Treatment Plan */}
                  <div className="bg-clinic-bg rounded-control p-4 space-y-3 border border-clinic-line">
                    <h4 className="font-bold text-clinic-primary-deep flex items-center gap-1.5">
                      <span>🌿 การวินิจฉัยและแผนการรักษา</span>
                    </h4>
                    <div className="space-y-1.5">
                      {treatment.ttmDiagnosis && (
                        <p className="text-xs">
                          <span className="font-semibold text-clinic-primary-deep">การวินิจฉัยแผนไทย:</span>{" "}
                          <span className="text-clinic-ink font-medium">{treatment.ttmDiagnosis}</span>
                        </p>
                      )}
                      {treatment.modernDiagnosis && (
                        <p className="text-xs">
                          <span className="font-semibold text-clinic-ink-soft">การวินิจฉัยแผนปัจจุบัน:</span>{" "}
                          <span className="text-clinic-ink">{treatment.modernDiagnosis}</span>
                        </p>
                      )}
                      {treatment.suggestions && (
                        <p className="text-xs pt-1 text-clinic-ink-soft">
                          <span className="font-semibold text-clinic-ink">คำแนะนำ:</span>{" "}
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
                      <span>💊 ยาสมุนไพรและเวชภัณฑ์ที่ได้รับ</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-clinic-line rounded-control overflow-hidden">
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
                              <td className="px-3.5 py-2 font-medium text-clinic-ink">
                                {m.medicineName}
                              </td>
                              <td className="px-3.5 py-2 text-center font-mono">{m.quantity}</td>
                              <td className="px-3.5 py-2 text-right font-mono">
                                ฿{m.priceAtTime.toLocaleString()}
                              </td>
                              <td className="px-3.5 py-2 text-right font-mono font-semibold text-clinic-primary-deep">
                                ฿{m.subTotal.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Receipt Status Footer */}
                {treatment.receipt && (
                  <div className="flex items-center justify-between pt-2 border-t border-clinic-line text-xs">
                    <span className="text-clinic-ink-soft">
                      ใบเสร็จรับเงิน #{treatment.receipt.receiptId} · สถานะ:{" "}
                      <span className="font-semibold text-emerald-700">
                        {treatment.receipt.paymentStatus === "PAID" ? "ชำระเงินเรียบร้อย" : treatment.receipt.paymentStatus}
                      </span>
                    </span>
                    <span className="font-bold text-sm text-clinic-primary-deep font-mono">
                      ยอดรวม: ฿{treatment.receipt.totalPrice.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-clinic-line rounded-card p-12 text-center text-clinic-ink-soft space-y-3">
          <div className="w-12 h-12 rounded-full bg-clinic-bg border border-clinic-line mx-auto flex items-center justify-center text-clinic-primary">
            <LeafIcon width={24} height={24} />
          </div>
          <h3 className="font-bold text-base text-clinic-ink">ยังไม่มีประวัติการบันทึกการรักษา</h3>
          <p className="text-xs text-clinic-ink-soft max-w-sm mx-auto">
            เมื่อท่านเข้ารับการตรวจรักษาที่คลินิก ประวัติการตรวจ วินิจฉัย และรายการยาจะแสดงที่นี่
          </p>
          <Link
            href="/patient/book"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-clinic-primary text-white text-xs font-semibold rounded-control hover:bg-clinic-primary-deep transition-colors mt-2"
          >
            + จองคิวออนไลน์ตอนนี้
          </Link>
        </div>
      )}
    </div>
  );
}
