"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { PatientResponseDTO, PageResponse, Gender } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
  Users,
  UserPlus,
  Search,
  Eye,
  Edit,
  ShieldAlert,
  RefreshCw,
  X,
  Stethoscope,
  Phone,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PatientListClientProps {
  initialData: PageResponse<PatientResponseDTO> | null;
}

const DHATU_THAI_MAP: Record<string, string> = {
  PATHAVI: "ปถวี (ดิน)",
  APO: "อาโป (น้ำ)",
  VAYO: "วาโย (ลม)",
  TECHO: "เตโช (ไฟ)",
};

export function PatientListClient({ initialData }: PatientListClientProps) {
  const [patients, setPatients] = useState<PatientResponseDTO[]>(
    initialData?.content ?? []
  );
  const [totalElements, setTotalElements] = useState<number>(
    initialData?.totalElements ?? 0
  );
  const [totalPages, setTotalPages] = useState<number>(
    initialData?.totalPages ?? 1
  );
  const [pageNumber, setPageNumber] = useState<number>(
    initialData?.pageNumber ?? 0
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | Gender>("ALL");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("ALL");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch patients from API with search query and page
  const fetchPatients = useCallback(
    async (targetPage = 0, query = searchQuery) => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const params = new URLSearchParams({
          page: String(targetPage),
          size: "50",
        });
        if (query.trim()) {
          params.set("query", query.trim());
        }

        const res = await fetch(`/api/patients?${params.toString()}`);
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || "ไม่สามารถโหลดรายชื่อผู้ป่วยได้");
        }
        const data: PageResponse<PatientResponseDTO> = await res.json();
        setPatients(data.content ?? []);
        setTotalElements(data.totalElements ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setPageNumber(data.pageNumber ?? 0);
      } catch (err: any) {
        setErrorMsg(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วย");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery]
  );

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPatients(0, searchQuery);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Client-side filtering for immediate feedback on gender, blood group, and query
  const filteredPatients = patients.filter((patient) => {
    // 1. Gender filter
    if (genderFilter !== "ALL" && patient.gender !== genderFilter) {
      return false;
    }

    // 2. Blood group filter
    if (bloodGroupFilter !== "ALL") {
      const bg = patient.bloodGroup?.toUpperCase() ?? "";
      const bgAbo = patient.bloodGroupAbo?.toUpperCase() ?? "";
      if (!bg.startsWith(bloodGroupFilter) && bgAbo !== bloodGroupFilter) {
        return false;
      }
    }

    // 3. Client-side query filter (instant fallback while waiting for debounce)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();
      const hnFormatted = `p-${String(patient.patientId).padStart(5, "0")}`.toLowerCase();
      const rawId = String(patient.patientId);

      const matchHn = hnFormatted.includes(q) || rawId === q;
      const matchName = patient.fullname?.toLowerCase().includes(q);
      const matchPhone = patient.mobileNumber?.toLowerCase().includes(q);
      const matchIdNum = patient.idNumber?.toLowerCase().includes(q);
      const matchNationalId = patient.nationalId?.toLowerCase().includes(q);
      const matchPassport = patient.passportNo?.toLowerCase().includes(q);

      if (
        !matchHn &&
        !matchName &&
        !matchPhone &&
        !matchIdNum &&
        !matchNationalId &&
        !matchPassport
      ) {
        return false;
      }
    }

    return true;
  });

  const clearAllFilters = () => {
    setSearchQuery("");
    setGenderFilter("ALL");
    setBloodGroupFilter("ALL");
    fetchPatients(0, "");
  };

  const isFiltering =
    searchQuery.trim() !== "" ||
    genderFilter !== "ALL" ||
    bloodGroupFilter !== "ALL";

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Users className="w-5 h-5 text-clinic-primary" />}
        title="รายชื่อผู้รับบริการ (Patients)"
        subtitle="ค้นหาและจัดการทะเบียนผู้ป่วย ตรวจสอบประวัติสุขภาพ ธาตุเจ้าเรือน และประวัติการรักษา"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPatients(pageNumber, searchQuery)}
              disabled={loading}
              className="gap-1.5"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </Button>
            <Button asChild variant="terracotta" size="sm" className="gap-1.5 shadow-xs">
              <Link href="/doctor/patients/new">
                <UserPlus className="w-4 h-4" />
                <span>เพิ่มผู้ป่วยใหม่</span>
              </Link>
            </Button>
          </div>
        }
      />

      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="hover:opacity-70 text-clinic-danger"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="border-clinic-line/70 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-clinic-ink-soft">
                <Search className="w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder="ค้นหาด้วยรหัส HN (เช่น P-00001), ชื่อ-นามสกุล, เบอร์โทร, เลขบัตร ปชช...."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-clinic-ink-soft hover:text-clinic-ink"
                  title="ล้างคำค้นหา"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Gender Filter */}
            <div className="lg:col-span-3">
              <Select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as "ALL" | Gender)}
              >
                <option value="ALL">เพศทั้งหมด</option>
                <option value="MALE">ชาย (Male)</option>
                <option value="FEMALE">หญิง (Female)</option>
              </Select>
            </div>

            {/* Blood Group Filter */}
            <div className="lg:col-span-3">
              <Select
                value={bloodGroupFilter}
                onChange={(e) => setBloodGroupFilter(e.target.value)}
              >
                <option value="ALL">กรุ๊ปเลือดทั้งหมด</option>
                <option value="A">กรุ๊ป A</option>
                <option value="B">กรุ๊ป B</option>
                <option value="O">กรุ๊ป O</option>
                <option value="AB">กรุ๊ป AB</option>
              </Select>
            </div>
          </div>

          {/* Active Filter Indicators & Result Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-clinic-ink-soft border-t border-clinic-line/40">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-clinic-primary shrink-0" />
              <span>
                {isFiltering ? (
                  <>
                    ผลการค้นหา:{" "}
                    <strong className="text-clinic-ink font-semibold">
                      {filteredPatients.length}
                    </strong>{" "}
                    ราย
                    {totalElements > 0 && ` (จากทั้งหมด ${totalElements} ราย)`}
                  </>
                ) : (
                  <>
                    ผู้ป่วยทั้งหมด:{" "}
                    <strong className="text-clinic-ink font-semibold">
                      {totalElements > 0 ? totalElements : filteredPatients.length}
                    </strong>{" "}
                    ราย
                  </>
                )}
              </span>
              {loading && (
                <span className="text-clinic-primary animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> กำลังค้นหา...
                </span>
              )}
            </div>

            {isFiltering && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs text-clinic-terracotta-deep hover:bg-clinic-terracotta-soft/50 gap-1"
              >
                <X className="w-3 h-3" />
                <span>ล้างตัวกรองทั้งหมด</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* When no patients exist in system at all */}
      {patients.length === 0 && !isFiltering && !loading && (
        <EmptyState
          icon={<Users className="w-8 h-8 text-clinic-primary" />}
          title="ยังไม่มีรายชื่อผู้ป่วยในระบบ"
          description="ท่านสามารถลงทะเบียนผู้ป่วยใหม่พร้อมบันทึกประวัติสุขภาพและธาตุเจ้าเรือนกำเนิดได้ทันที"
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

      {/* When search yields no results */}
      {filteredPatients.length === 0 && isFiltering && !loading && (
        <EmptyState
          icon={<Search className="w-8 h-8 text-clinic-ink-muted" />}
          title="ไม่พบข้อมูลผู้ป่วยที่ตรงกับการค้นหา"
          description={`ไม่พบผู้ป่วยที่ตรงกับเงื่อนไขการค้นหา "${searchQuery}" หรือตัวกรองที่เลือก`}
          action={
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              ล้างการค้นหา
            </Button>
          }
        />
      )}

      {/* Patient Table */}
      {filteredPatients.length > 0 && (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">รหัส HN</TableHead>
                <TableHead>ชื่อ-นามสกุล / เลขประจำตัว</TableHead>
                <TableHead className="w-20">เพศ</TableHead>
                <TableHead>เบอร์โทรศัพท์</TableHead>
                <TableHead className="w-24">กรุ๊ปเลือด</TableHead>
                <TableHead>ธาตุเจ้าเรือน</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const hnDisplay = `P-${String(patient.patientId).padStart(5, "0")}`;
                const principalDhatu =
                  patient.principle?.principalDhatu
                    ? DHATU_THAI_MAP[patient.principle.principalDhatu] ||
                      patient.principle.principalDhatu
                    : null;

                return (
                  <TableRow key={patient.patientId} className="hover:bg-clinic-bg/50">
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-mono text-[11px] font-medium"
                      >
                        {hnDisplay}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-clinic-ink">
                          {patient.fullname}
                        </span>
                        {(patient.nationalId || patient.passportNo) && (
                          <span className="text-[11px] font-mono text-clinic-ink-muted">
                            {patient.idType === "PASSPORT"
                              ? `Passport: ${patient.passportNo}`
                              : `เลข ปชช.: ${patient.nationalId}`}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.gender === "MALE" ? (
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-blue-800 text-[11px]"
                        >
                          ชาย
                        </Badge>
                      ) : patient.gender === "FEMALE" ? (
                        <Badge
                          variant="outline"
                          className="border-rose-200 bg-rose-50 text-rose-800 text-[11px]"
                        >
                          หญิง
                        </Badge>
                      ) : (
                        <span className="text-xs text-clinic-ink-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.mobileNumber ? (
                        <a
                          href={`tel:${patient.mobileNumber}`}
                          className="font-mono text-xs text-clinic-ink hover:text-clinic-primary flex items-center gap-1.5 transition-colors"
                          title="โทรออก"
                        >
                          <Phone className="w-3 h-3 text-clinic-ink-soft shrink-0" />
                          <span>{patient.mobileNumber}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-clinic-ink-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.bloodGroup ? (
                        <Badge variant="outline" className="font-mono text-[11px]">
                          {patient.bloodGroup}
                        </Badge>
                      ) : patient.bloodGroupAbo ? (
                        <Badge variant="outline" className="font-mono text-[11px]">
                          {patient.bloodGroupAbo}
                          {patient.bloodGroupRh === "POSITIVE"
                            ? "+"
                            : patient.bloodGroupRh === "NEGATIVE"
                            ? "-"
                            : ""}
                        </Badge>
                      ) : (
                        <span className="text-xs text-clinic-ink-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {principalDhatu ? (
                        <span className="text-xs font-medium text-clinic-primary">
                          {principalDhatu}
                        </span>
                      ) : (
                        <span className="text-xs text-clinic-ink-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-clinic-primary hover:bg-clinic-primary-soft"
                          title="ดูข้อมูลประวัติผู้ป่วย"
                        >
                          <Link href={`/doctor/patients/${patient.patientId}`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">ดูข้อมูล</span>
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-clinic-accent-deep hover:bg-clinic-accent-soft"
                          title="บันทึกการรักษาผู้ป่วยรายนี้"
                        >
                          <Link href={`/doctor/treatments/new?patientId=${patient.patientId}`}>
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">ตรวจรักษา</span>
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-clinic-terracotta-deep hover:bg-clinic-terracotta-soft"
                          title="แก้ไขข้อมูลผู้ป่วย"
                        >
                          <Link href={`/doctor/patients/${patient.patientId}/edit`}>
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">แก้ไข</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-clinic-ink-soft">
                หน้า {pageNumber + 1} จาก {totalPages} (ทั้งหมด {totalElements} รายการ)
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPatients(pageNumber - 1, searchQuery)}
                  disabled={pageNumber <= 0 || loading}
                  className="h-8 gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>ก่อนหน้า</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPatients(pageNumber + 1, searchQuery)}
                  disabled={pageNumber >= totalPages - 1 || loading}
                  className="h-8 gap-1 text-xs"
                >
                  <span>ถัดไป</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
