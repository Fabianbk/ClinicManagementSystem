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
    <>
      <div className="page-header">
        <h1>รายชื่อผู้ป่วย</h1>
        <Link href="/doctor/patients/new" className="btn btn--primary">
          + เพิ่มผู้ป่วยใหม่
        </Link>
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}

      {result && result.content.length === 0 && (
        <div className="empty-state">ไม่พบข้อมูลผู้ป่วยในระบบ</div>
      )}

      {result && result.content.length > 0 && (
        <>
          <div className="data-table__wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อ-สกุล</th>
                  <th>เพศ</th>
                  <th>เบอร์โทร</th>
                  <th>กรุ๊ปเลือด</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {result.content.map((patient) => (
                  <tr key={patient.patientId}>
                    <td>{patient.patientId}</td>
                    <td>{patient.fullname}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.mobileNumber}</td>
                    <td>{patient.bloodGroup}</td>
                    <td>
                      <Link href={`/doctor/patients/${patient.patientId}`} className="data-table__view">
                        ดูข้อมูล
                      </Link>
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
    </>
  );
}