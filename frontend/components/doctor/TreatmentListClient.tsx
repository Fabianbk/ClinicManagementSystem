"use client";

import { useState } from "react";
import Link from "next/link";
import type { RecordTreatmentResponseDTO, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  RefreshCw,
  AlertCircle,
  Calendar,
  Pill,
} from "lucide-react";

interface TreatmentListClientProps {
  doctorId: number;
  doctorName?: string;
  initialData: PageResponse<RecordTreatmentResponseDTO> | null;
}

function formatDateThai(dateInput: string | Date | undefined): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TreatmentListClient({
  doctorId,
  doctorName,
  initialData,
}: TreatmentListClientProps) {
  const [treatments, setTreatments] = useState<RecordTreatmentResponseDTO[]>(
    initialData?.content ?? []
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reload treatments
  const refreshTreatments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/record-treatments?page=0&size=100`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดรายการบันทึกการรักษาได้");
      const data: PageResponse<RecordTreatmentResponseDTO> = await res.json();
      setTreatments(data.content ?? []);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Filter treatments
  const filteredTreatments = treatments.filter((item) => {
    if (selectedDate !== "") {
      const itemDateStr = item.recordDate
        ? new Date(item.recordDate).toISOString().split("T")[0]
        : "";
      if (itemDateStr !== selectedDate) return false;
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchPatient = item.patientFullname?.toLowerCase().includes(q);
      const matchDoctor = item.doctorFullname?.toLowerCase().includes(q);
      const matchSymptoms = item.symptoms?.toLowerCase().includes(q);
      const matchTtm = item.ttmDiagnosis?.toLowerCase().includes(q);
      const matchId =
        item.recordTreatmentId?.toString().includes(q) ||
        item.patientId?.toString().includes(q);
      if (!matchPatient && !matchDoctor && !matchSymptoms && !matchTtm && !matchId) {
        return false;
      }
    }

    return true;
  });

  const totalCount = treatments.length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = treatments.filter((t) => {
    const tDate = t.recordDate ? new Date(t.recordDate).toISOString().split("T")[0] : "";
    return tDate === todayStr;
  }).length;

  return (
    <div className="space-y-6 pb-20 font-body text-clinic-ink">
      <PageHeader
        icon={<FileText className="w-5 h-5 text-clinic-primary" />}
        title="เวชระเบียนและการรักษา (Medical Records)"
        subtitle="ประวัติการตรวจวินิจฉัยทางการแพทย์แผนไทย หัตถการบำบัด และการจ่ายยาสมุนไพร"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshTreatments}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>รีเฟรช</span>
            </Button>
            <Button asChild variant="terracotta" size="sm" className="gap-1.5 shadow-xs">
              <Link href="/doctor/treatments/new">
                <Plus className="w-4 h-4" />
                <span>+ บันทึกการรักษาใหม่</span>
              </Link>
            </Button>
          </div>
        }
      />

      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-xs underline cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-clinic-ink-soft">เวชระเบียนทั้งหมด</p>
            <p className="text-2xl font-bold font-display text-clinic-primary-deep mt-1">
              {totalCount} <span className="text-xs font-normal text-clinic-ink-soft">เคส</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-clinic-terracotta-deep">ตรวจรักษาในวันนี้</p>
            <p className="text-2xl font-bold font-display text-clinic-terracotta-deep mt-1">
              {todayCount} <span className="text-xs font-normal text-clinic-ink-soft">เคส</span>
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-clinic-primary">แพทย์ผู้ตรวจหลัก</p>
            <p className="text-lg font-bold font-display text-clinic-primary mt-1 truncate">
              {doctorName || `พท. ID: ${doctorId}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-clinic-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="ค้นหาชื่อผู้ป่วย, อาการ, วินิจฉัยแผนไทย หรือรหัสเวชระเบียน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-44">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs"
            />
          </div>

          {(searchQuery || selectedDate) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedDate("");
              }}
              className="text-xs text-clinic-ink-soft shrink-0"
            >
              ล้างตัวกรอง
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Treatments Table */}
      {filteredTreatments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">รหัสเคส</TableHead>
              <TableHead className="w-32">วันที่ตรวจ</TableHead>
              <TableHead>ผู้ป่วย</TableHead>
              <TableHead>อาการ & การวินิจฉัยแผนไทย</TableHead>
              <TableHead>แพทย์ผู้ตรวจ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTreatments.map((t) => {
              const meds = t.recordTreatmentMedicines || [];

              return (
                <TableRow key={t.recordTreatmentId}>
                  <TableCell className="font-mono text-xs text-clinic-ink-soft">
                    #{t.recordTreatmentId}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-clinic-ink">
                    {formatDateThai(t.recordDate)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-clinic-ink block">
                        {t.patientFullname || `ผู้ป่วย #${t.patientId}`}
                      </span>
                      {t.patientId && (
                        <span className="text-[11px] font-mono text-clinic-ink-soft block">
                          HN: P-{String(t.patientId).padStart(5, "0")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <p className="text-clinic-ink">
                        <strong className="text-clinic-ink-soft">อาการ:</strong> {t.symptoms || "-"}
                      </p>
                      {t.ttmDiagnosis && (
                        <p className="text-clinic-primary font-semibold">
                          <strong className="text-clinic-ink-soft">แผนไทย:</strong> {t.ttmDiagnosis}
                        </p>
                      )}
                      {meds.length > 0 && (
                        <p className="text-[11px] text-clinic-ink-soft flex items-center gap-1">
                          <Pill className="w-3 h-3 text-clinic-terracotta" />
                          <span>จ่ายยา {meds.length} รายการ</span>
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-clinic-ink-soft">
                    {t.doctorFullname}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-clinic-primary gap-1">
                        <Link href={`/doctor/treatments/${t.recordTreatmentId}`}>
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูเวชระเบียน</span>
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-clinic-terracotta-deep gap-1">
                        <Link href={`/doctor/treatments/${t.recordTreatmentId}/edit`}>
                          <Edit className="w-3.5 h-3.5" />
                          <span>แก้ไข</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-clinic-primary" />}
          title="ไม่พบรายการบันทึกการรักษา"
          description="ท่านสามารถบันทึกการตรวจรักษา อาการ วินิจฉัย และสั่งจ่ายยาสมุนไพรได้"
          action={
            <Button asChild variant="terracotta" size="sm">
              <Link href="/doctor/treatments/new">
                <Plus className="w-4 h-4 mr-1" />
                <span>+ บันทึกการรักษาใหม่</span>
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
