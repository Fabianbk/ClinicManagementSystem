import Link from "next/link";
import { getPatients } from "@/lib/resources/patients";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ApiError } from "@/lib/api-client";
import type { PageResponse, PatientResponseDTO } from "@/lib/types";

const PAGE_SIZE = 10;

export default async function DoctorPatientsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page ?? 0);

  let result: PageResponse<PatientResponseDTO> | null = null;
  let errorMessage: string | null = null;

  try {
    result = await getPatients(page, PAGE_SIZE);
  } catch (err) {
    errorMessage = err instanceof ApiError ? err.message : "ไม่สามารถเชื่อมต่อกับระบบได้";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-clinic-primary-deep">
          รายชื่อผู้ป่วย
        </h1>
        <Link
          href="/doctor/patients/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-sm"
        >
          + เพิ่มผู้ป่วยใหม่
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {result && result.content.length === 0 && (
        <div className="border border-dashed border-clinic-line rounded-card p-12 text-center text-clinic-ink-soft bg-white/50">
          ไม่พบข้อมูลผู้ป่วยในระบบ
        </div>
      )}

      {result && result.content.length > 0 && (
        <>
          <div className="bg-white border border-clinic-line rounded-card overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-clinic-bg border-b border-clinic-line">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">รหัส</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">เพศ</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">เบอร์โทร</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">กรุ๊ปเลือด</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-line text-sm text-clinic-ink">
                {result.content.map((patient) => (
                  <tr key={patient.patientId} className="hover:bg-clinic-bg/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs">{patient.patientId}</td>
                    <td className="px-4 py-3.5 font-medium">{patient.fullname}</td>
                    <td className="px-4 py-3.5">{patient.gender === "MALE" ? "ชาย" : patient.gender === "FEMALE" ? "หญิง" : patient.gender}</td>
                    <td className="px-4 py-3.5 font-mono">{patient.mobileNumber}</td>
                    <td className="px-4 py-3.5 font-bold text-clinic-primary-deep">{patient.bloodGroup || "-"}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/doctor/patients/${patient.patientId}`}
                          className="text-clinic-primary-deep font-semibold text-xs hover:underline"
                        >
                          ดูข้อมูล
                        </Link>
                        <Link
                          href={`/doctor/patients/${patient.patientId}/edit`}
                          className="text-clinic-accent-deep font-semibold text-xs hover:underline"
                        >
                          แก้ไข
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={result.pageNumber}
            totalPages={result.totalPages}
            basePath="/doctor/patients"
          />
        </>
      )}
    </div>
  );
}