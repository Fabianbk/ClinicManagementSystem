import { notFound } from "next/navigation";
import { getRecordTreatment } from "@/lib/resources/record-treatments";
import { getPatient } from "@/lib/resources/patients";
import { PrintToolbar } from "@/components/print/PrintToolbar";
import { formatThaiDate, formatDoctorDisplayName, thaiBahtText } from "@/lib/utils";

interface TreatmentOrderPrintPageProps {
  params: { treatmentId: string };
}

export default async function TreatmentOrderPrintPage({ params }: TreatmentOrderPrintPageProps) {
  const treatmentId = Number(params.treatmentId);
  if (isNaN(treatmentId)) {
    notFound();
  }

  const treatment = await getRecordTreatment(treatmentId).catch(() => null);
  if (!treatment) {
    notFound();
  }

  const patient = await getPatient(treatment.patientId).catch(() => null);

  const hnCode = `P-${String(treatment.patientId).padStart(5, "0")}`;
  const medicines = treatment.recordTreatmentMedicines || [];
  const receipt = treatment.receipt;
  const additionalItems = receipt?.additionalItems || [];

  // Combine items for itemized billing table
  const items: Array<{
    name: string;
    category: string;
    qty: number;
    unitPrice: number;
    total: number;
    note?: string;
  }> = [];

  // 1. Herbal medicines
  medicines.forEach((m) => {
    items.push({
      name: m.medicineName,
      category: "ยาสมุนไพร",
      qty: m.quantity,
      unitPrice: m.priceAtTime,
      total: m.subTotal,
      note: m.note || undefined,
    });
  });

  // 2. Additional services / procedures
  additionalItems.forEach((item) => {
    items.push({
      name: item.itemName,
      category: "หัตถการ/บริการ",
      qty: 1,
      unitPrice: item.amount,
      total: item.amount,
    });
  });

  // If no items in receipt but treatment program mentioned, add row
  if (items.length === 0 && treatment.treatmentProgram) {
    items.push({
      name: treatment.treatmentProgram,
      category: "หัตถการบำบัด",
      qty: 1,
      unitPrice: 0,
      total: 0,
    });
  }

  const grandTotal = receipt?.totalPrice ?? items.reduce((sum, item) => sum + item.total, 0);
  const bahtText = thaiBahtText(grandTotal);

  return (
    <div className="py-6">
      <PrintToolbar
        documentTitle={`ใบสั่งการรักษาและค่าใช้จ่าย (Treatment Order & Billing) - ${treatment.patientFullname}`}
        subtitle={`HN: ${hnCode} · เวชระเบียน #${treatment.recordTreatmentId} · รวมทั้งสิ้น ฿${grandTotal.toLocaleString()}`}
        docxUrl={`/api/documents/treatment-order/${treatment.recordTreatmentId}`}
        docxFilename={`treatment-order-${treatment.recordTreatmentId}.docx`}
      />

      {/* 1-Page Official Treatment Order & Billing */}
      <main className="a4-sheet space-y-4 text-xs font-body text-slate-900 leading-relaxed">
        {/* Clinic Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-3">
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            พิมพ์วิมานคลินิกการแพทย์แผนไทย (Pimvimaan Thai Traditional Medicine Clinic)
          </h2>
          <p className="text-[11px] text-slate-600 mt-0.5">
            ใบอนุญาตให้จัดตั้งคลินิกเลขที่ 10108002264 · โทรศัพท์: 081-9358026
          </p>
          <div className="inline-block mt-1 px-3 py-0.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xs">
            ใบสั่งการรักษาและค่าใช้จ่าย (TREATMENT ORDER &amp; BILLING)
          </div>
        </div>

        {/* Patient & Doctor Meta Grid */}
        <div className="border border-slate-400 p-3 rounded-xs bg-slate-50/60 grid grid-cols-12 gap-2 text-xs">
          <div className="col-span-8 flex items-baseline gap-1">
            <span className="text-slate-600">ชื่อ - สกุล ผู้รับบริการ:</span>
            <strong className="text-slate-900">{treatment.patientFullname}</strong>
          </div>
          <div className="col-span-4 flex items-baseline gap-1 font-mono font-bold text-emerald-800">
            <span className="text-slate-600 font-sans font-normal">HN:</span>
            <span>{hnCode}</span>
          </div>

          <div className="col-span-4 flex items-baseline gap-1">
            <span className="text-slate-600">วันที่ตรวจรักษา:</span>
            <span className="font-medium">{formatThaiDate(treatment.recordDate)}</span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="text-slate-600">เลขที่เวชระเบียน:</span>
            <span className="font-mono font-semibold">#{treatment.recordTreatmentId}</span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="text-slate-600">เลขที่ใบเสร็จ:</span>
            <span className="font-mono font-semibold">{receipt ? `#${receipt.receiptId}` : "-"}</span>
          </div>

          <div className="col-span-8 flex items-baseline gap-1">
            <span className="text-slate-600">แพทย์แผนไทยผู้ตรวจ:</span>
            <span className="font-semibold text-slate-900">
              {formatDoctorDisplayName(treatment.doctorFullname)}
            </span>
          </div>
          <div className="col-span-4 flex items-baseline gap-1">
            <span className="text-slate-600">สิทธิการรักษา:</span>
            <span>{patient?.treatmentRights || "ชำระเงินเอง (Self-pay)"}</span>
          </div>

          {treatment.ttmDiagnosis && (
            <div className="col-span-12 pt-1 border-t border-slate-200 flex items-baseline gap-1">
              <span className="text-slate-600">การวินิจฉัยแพทย์แผนไทย:</span>
              <strong className="text-emerald-950">{treatment.ttmDiagnosis}</strong>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-400 rounded-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 border-b border-slate-400">
              <tr>
                <th className="p-2 text-center w-10">ลำดับ</th>
                <th className="p-2">รายการหัตถการบำบัด / ยาสมุนไพร</th>
                <th className="p-2 text-center w-24">ประเภท</th>
                <th className="p-2 text-center w-16">จำนวน</th>
                <th className="p-2 text-right w-24">ราคา/หน่วย</th>
                <th className="p-2 text-right w-28">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="p-2">
                    <span className="font-medium text-slate-900 block">{item.name}</span>
                    {item.note && (
                      <span className="text-[11px] text-slate-500 block leading-tight">{item.note}</span>
                    )}
                  </td>
                  <td className="p-2 text-center text-slate-600 text-[11px]">{item.category}</td>
                  <td className="p-2 text-center font-mono">{item.qty}</td>
                  <td className="p-2 text-right font-mono">{item.unitPrice.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono font-semibold text-slate-900">
                    {item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                    ไม่มีรายการหัตถการหรือสั่งจ่ายยา
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t-2 border-slate-400 bg-slate-50 font-medium">
              {receipt?.medicineTotal !== undefined && receipt.medicineTotal !== null && (
                <tr>
                  <td colSpan={5} className="p-1.5 text-right text-slate-600">
                    รวมค่ายาสมุนไพร:
                  </td>
                  <td className="p-1.5 text-right font-mono">฿{receipt.medicineTotal.toLocaleString()}</td>
                </tr>
              )}
              {additionalItems.length > 0 && (
                <tr>
                  <td colSpan={5} className="p-1.5 text-right text-slate-600">
                    รวมค่าบริการและหัตถการ:
                  </td>
                  <td className="p-1.5 text-right font-mono">
                    ฿{additionalItems.reduce((s, it) => s + (it.amount || 0), 0).toLocaleString()}
                  </td>
                </tr>
              )}
              <tr className="border-t border-slate-300 bg-slate-100">
                <td colSpan={4} className="p-2.5 font-bold text-slate-800 text-[11px]">
                  จำนวนเงินตัวอักษร: <span className="text-emerald-900 underline font-normal">{bahtText}</span>
                </td>
                <td className="p-2.5 text-right font-bold text-slate-900">ยอดชำระสุทธิ:</td>
                <td className="p-2.5 text-right font-mono font-bold text-sm text-emerald-900">
                  ฿{grandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment & Advice Box */}
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div className="p-2.5 border border-slate-300 rounded bg-slate-50/50 space-y-1">
            <span className="font-bold text-slate-800 block">สถานะการชำระเงิน (Payment Status):</span>
            <p>
              สถานะ: <strong className="text-emerald-800">{receipt?.paymentStatus === "PAID" ? "ชำระเงินเรียบร้อยแล้ว (PAID)" : receipt?.paymentStatus || "รอชำระเงิน"}</strong>
            </p>
            {receipt?.paymentMethod && (
              <p className="text-slate-600">
                วิธีชำระ: {receipt.paymentMethod === "CASH" ? "เงินสด (Cash)" : receipt.paymentMethod === "TRANSFER" ? "โอนเงินผ่านบัญชี (Bank Transfer)" : receipt.paymentMethod}
              </p>
            )}
          </div>

          <div className="p-2.5 border border-slate-300 rounded bg-slate-50/50 space-y-1">
            <span className="font-bold text-slate-800 block">ข้อแนะนำในการใช้ยาและหัตถการ:</span>
            <p className="text-slate-700 leading-tight">
              {treatment.suggestions || "กรุณารับประทานยาตามคำแนะนำอย่างเคร่งครัดและสังเกตอาการผิดปกติ"}
            </p>
          </div>
        </div>

        {/* Dual Signatures */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-6">
            <p className="text-slate-600">ลงชื่อผู้รับบริการ / ผู้ชำระเงิน</p>
            <p className="font-medium text-slate-900">({treatment.patientFullname})</p>
            <p className="text-[10px] text-slate-500">วันที่ {formatThaiDate(treatment.recordDate)}</p>
          </div>
          <div className="space-y-6">
            <p className="text-slate-600">ลงชื่อแพทย์แผนไทยผู้สั่งการรักษา / ผู้รับเงิน</p>
            <p className="font-bold text-slate-900">({formatDoctorDisplayName(treatment.doctorFullname)})</p>
            <p className="text-[10px] text-slate-500">แพทย์แผนไทยประจำพิมพ์วิมานคลินิก</p>
          </div>
        </div>
      </main>
    </div>
  );
}
