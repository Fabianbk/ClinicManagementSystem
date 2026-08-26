import Link from "next/link";
import { getPatients } from "@/lib/resources/patients";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ApiError } from "@/lib/api-client";
import type { PageResponse, PatientResponseDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Users, UserPlus, Eye, Edit, ShieldAlert } from "lucide-react";

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
      <PageHeader
        icon={<Users className="w-5 h-5 text-clinic-primary" />}
        title="รายชื่อผู้รับบริการ (Patients)"
        subtitle="จัดการทะเบียนผู้ป่วย ตรวจสอบประวัติสุขภาพ ธาตุเจ้าเรือน และการแพ้ยา"
        actions={
          <Button asChild variant="terracotta" size="sm" className="gap-1.5 shadow-xs">
            <Link href="/doctor/patients/new">
              <UserPlus className="w-4 h-4" />
              <span>เพิ่มผู้ป่วยใหม่</span>
            </Link>
          </Button>
        }
      />

      {errorMessage && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {result && result.content.length === 0 && (
        <EmptyState
          icon={<Users className="w-6 h-6 text-clinic-primary" />}
          title="ยังไม่มีรายชื่อผู้ป่วยในระบบ"
          description="ท่านสามารถลงทะเบียนผู้ป่วยใหม่พร้อมบันทึกประวัติสุขภาพและธาตุเจ้าเรือนกำเนิดได้"
          action={
            <Button asChild variant="terracotta" size="sm">
              <Link href="/doctor/patients/new">
                <UserPlus className="w-4 h-4" />
                <span>+ ลงทะเบียนผู้ป่วยคนแรก</span>
              </Link>
            </Button>
          }
        />
      )}

      {result && result.content.length > 0 && (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">รหัส HN</TableHead>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>เพศ</TableHead>
                <TableHead>เบอร์โทรศัพท์</TableHead>
                <TableHead>กรุ๊ปเลือด</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.content.map((patient) => (
                <TableRow key={patient.patientId}>
                  <TableCell className="font-mono text-xs text-clinic-ink-soft">
                    P-{String(patient.patientId).padStart(5, "0")}
                  </TableCell>
                  <TableCell className="font-medium text-clinic-ink">
                    {patient.fullname}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-clinic-ink-soft">{patient.gender || "-"}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {patient.mobileNumber || "-"}
                  </TableCell>
                  <TableCell>
                    {patient.bloodGroup ? (
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {patient.bloodGroup}
                      </Badge>
                    ) : (
                      <span className="text-xs text-clinic-ink-muted">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-clinic-primary">
                        <Link href={`/doctor/patients/${patient.patientId}`}>
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูข้อมูล</span>
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-clinic-terracotta-deep">
                        <Link href={`/doctor/patients/${patient.patientId}/edit`}>
                          <Edit className="w-3.5 h-3.5" />
                          <span>แก้ไข</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PaginationControls
            currentPage={result.pageNumber}
            totalPages={result.totalPages}
            basePath="/doctor/patients"
          />
        </div>
      )}
    </div>
  );
}