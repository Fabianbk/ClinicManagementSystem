"use client";

import { useState } from "react";
import type { MedicineResponseDTO, PageResponse, MedicineRequestDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pill,
  Plus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Archive,
} from "lucide-react";

interface MedicineManagerClientProps {
  initialData: PageResponse<MedicineResponseDTO> | null;
}

const CATEGORY_OPTIONS = [
  "ทั้งหมด",
  "ยาสมุนไพร",
  "ยาเม็ด (Tablet)",
  "ยาน้ำ (Syrup)",
  "ยาภายนอก (External)",
  "ยาทา/ยาหม่อง",
  "เวชภัณฑ์ทั่วไป",
];

export function MedicineManagerClient({ initialData }: MedicineManagerClientProps) {
  const [medicines, setMedicines] = useState<MedicineResponseDTO[]>(
    initialData?.content ?? []
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineResponseDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [medicineName, setMedicineName] = useState("");
  const [medicineCategory, setMedicineCategory] = useState("ยาสมุนไพร");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [unitType, setUnitType] = useState("เม็ด");
  const [stockRemaining, setStockRemaining] = useState<number>(0);
  const [stockBroughtForward, setStockBroughtForward] = useState<number>(0);
  const [stockReceived, setStockReceived] = useState<number>(0);
  const [stockIssued, setStockIssued] = useState<number>(0);
  const [note, setNote] = useState("");

  // Reload medicines list
  const refreshMedicines = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/medicines?page=0&size=100");
      if (!res.ok) throw new Error("ไม่สามารถโหลดรายการยาได้");
      const data: PageResponse<MedicineResponseDTO> = await res.json();
      setMedicines(data.content ?? []);
    } catch (err: any) {
      setErrorMsg(err.message || "ไม่สามารถโหลดรายการยาได้");
    } finally {
      setLoading(false);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingMedicine(null);
    setMedicineName("");
    setMedicineCategory("ยาสมุนไพร");
    setUnitPrice(0);
    setUnitType("เม็ด");
    setStockRemaining(100);
    setStockBroughtForward(0);
    setStockReceived(100);
    setStockIssued(0);
    setNote("");
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (med: MedicineResponseDTO) => {
    setEditingMedicine(med);
    setMedicineName(med.medicineName);
    setMedicineCategory(med.medicineCategory || "ยาสมุนไพร");
    setUnitPrice(med.unitPrice ?? 0);
    setUnitType(med.unitType || "เม็ด");
    setStockRemaining(med.stockRemaining ?? 0);
    setStockBroughtForward(med.stockBroughtForward ?? 0);
    setStockReceived(med.stockReceived ?? 0);
    setStockIssued(med.stockIssued ?? 0);
    setNote(med.note || "");
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!medicineName.trim()) {
      setErrorMsg("กรุณากรอกชื่อยา");
      return;
    }

    const payload: MedicineRequestDTO = {
      medicineName: medicineName.trim(),
      medicineCategory,
      unitPrice: Number(unitPrice),
      unitType: unitType.trim(),
      stockRemaining: Number(stockRemaining),
      stockBroughtForward: Number(stockBroughtForward),
      stockReceived: Number(stockReceived),
      stockIssued: Number(stockIssued),
      note: note.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingMedicine) {
        // Edit existing
        const res = await fetch(`/api/medicines/${editingMedicine.medicineId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || "ไม่สามารถอัปเดตข้อมูลยาได้");
        }
        setSuccessMsg(`อัปเดตข้อมูลยา "${payload.medicineName}" เรียบร้อยแล้ว`);
      } else {
        // Add new
        const res = await fetch("/api/medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || "ไม่สามารถเพิ่มยาใหม่ได้");
        }
        setSuccessMsg(`เพิ่มยา "${payload.medicineName}" เข้าสู่คลังยาเรียบร้อยแล้ว`);
      }

      setIsModalOpen(false);
      refreshMedicines();
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Medicine
  const handleDelete = async (medicineId: number, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบยา "${name}" ออกจากคลัง?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/medicines/${medicineId}`, { method: "DELETE" });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "ไม่สามารถลบยาได้ (อาจมียานี้ในประวัติการรักษา)");
      }
      setSuccessMsg(`ลบยา "${name}" เรียบร้อยแล้ว`);
      refreshMedicines();
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการลบยา");
    } finally {
      setLoading(false);
    }
  };

  // Filter medicines
  const filteredMedicines = medicines.filter((med) => {
    if (selectedCategory !== "ทั้งหมด" && med.medicineCategory !== selectedCategory) {
      return false;
    }
    if (showLowStockOnly && (med.stockRemaining ?? 0) > 20) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = med.medicineName.toLowerCase().includes(q);
      const matchCat = med.medicineCategory?.toLowerCase().includes(q);
      const matchNote = med.note?.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchNote) return false;
    }
    return true;
  });

  const lowStockCount = medicines.filter((m) => (m.stockRemaining ?? 0) <= 20).length;

  return (
    <div className="space-y-6 pb-20 font-body text-clinic-ink">
      <PageHeader
        icon={<Pill className="w-5 h-5 text-clinic-primary" />}
        title="คลังยาสมุนไพรและเวชภัณฑ์ (Pharmacy & Inventory)"
        subtitle="จัดการสต็อกยาสมุนไพร ตำรับยาไทย ราคาต่อหน่วย และการตรวจนับยอดคงเหลือ"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refreshMedicines}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>รีเฟรช</span>
            </Button>
            <Button
              type="button"
              variant="terracotta"
              size="sm"
              onClick={openCreateModal}
              className="gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มยาสมุนไพรใหม่</span>
            </Button>
          </div>
        }
      />

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-xs underline cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-control bg-clinic-success-bg border border-clinic-success text-clinic-success text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs underline cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-clinic-ink-soft">รายการยาทั้งหมด</p>
            <p className="text-2xl font-bold font-display text-clinic-primary-deep mt-1">
              {medicines.length} <span className="text-xs font-normal text-clinic-ink-soft">รายการ</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-amber-800">ยาที่สต็อกใกล้หมด (≤ 20)</p>
            <p className="text-2xl font-bold font-display text-amber-900 mt-1">
              {lowStockCount} <span className="text-xs font-normal text-clinic-ink-soft">รายการ</span>
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold text-clinic-primary">หมวดหมู่ยา</p>
            <p className="text-2xl font-bold font-display text-clinic-primary mt-1">
              {CATEGORY_OPTIONS.length - 1} <span className="text-xs font-normal text-clinic-ink-soft">หมวดหมู่</span>
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
              placeholder="ค้นหาชื่อยา, สรรพคุณ หรือหมายเหตุ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-clinic-ink select-none cursor-pointer whitespace-nowrap px-2">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="rounded text-clinic-terracotta focus:ring-clinic-terracotta"
            />
            <span>แสดงเฉพาะยาใกล้หมด</span>
          </label>
        </CardContent>
      </Card>

      {/* Medicine Table */}
      {filteredMedicines.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">รหัส</TableHead>
              <TableHead>ชื่อยาสมุนไพร / เวชภัณฑ์</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead className="text-right">ราคา/หน่วย</TableHead>
              <TableHead className="text-center">คงเหลือ (Stock)</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.map((med) => {
              const remaining = med.stockRemaining ?? 0;
              const isLowStock = remaining <= 20;

              return (
                <TableRow key={med.medicineId}>
                  <TableCell className="font-mono text-xs text-clinic-ink-soft">
                    #{med.medicineId}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-clinic-ink block">
                        {med.medicineName}
                      </span>
                      {med.note && (
                        <span className="text-xs text-clinic-ink-soft block line-clamp-1">
                          {med.note}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {med.medicineCategory || "ยาสมุนไพร"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-clinic-ink">
                    ฿{(med.unitPrice ?? 0).toLocaleString()} / {med.unitType || "หน่วย"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                        isLowStock
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {remaining} {med.unitType || "หน่วย"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(med)}
                        className="h-7 px-2 text-xs text-clinic-primary gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(med.medicineId, med.medicineName)}
                        className="h-7 px-2 text-xs text-clinic-danger hover:bg-clinic-danger-bg gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
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
          icon={<Archive className="w-6 h-6 text-clinic-primary" />}
          title="ไม่พบรายการยาตามเงื่อนไขที่เลือก"
          description="ท่านสามารถกดปุ่มเพิ่มยาใหม่ หรือปรับเปลี่ยนคำค้นหา"
          action={
            <Button type="button" variant="terracotta" size="sm" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-1" />
              <span>+ เพิ่มยาสมุนไพรใหม่</span>
            </Button>
          }
        />
      )}

      {/* Add / Edit Medicine Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMedicine ? `แก้ไขข้อมูลยา: ${editingMedicine.medicineName}` : "เพิ่มยาสมุนไพร / เวชภัณฑ์ใหม่"}
            </DialogTitle>
            <DialogDescription>
              บันทึกข้อมูลชื่อยา หมวดหมู่ ราคาต่อหน่วย และยอดคงเหลือในคลัง
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="medicineName" required>
                ชื่อยาสมุนไพร / ตำรับยา (Medicine Name)
              </Label>
              <Input
                id="medicineName"
                required
                placeholder="เช่น ขมิ้นชันแคปซูล, ยาหอมนวโกฐ"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="medicineCategory" required>
                  หมวดหมู่ยา
                </Label>
                <Select
                  id="medicineCategory"
                  value={medicineCategory}
                  onChange={(e) => setMedicineCategory(e.target.value)}
                >
                  {CATEGORY_OPTIONS.filter((c) => c !== "ทั้งหมด").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unitType" required>
                  หน่วยนับ (Unit)
                </Label>
                <Input
                  id="unitType"
                  required
                  placeholder="เช่น เม็ด, ซอง, ขวด"
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="unitPrice" required>
                  ราคาต่อหน่วย (บาท)
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min={0}
                  step={0.5}
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stockRemaining" required>
                  จำนวนคงเหลือในคลัง
                </Label>
                <Input
                  id="stockRemaining"
                  type="number"
                  min={0}
                  required
                  value={stockRemaining}
                  onChange={(e) => setStockRemaining(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">สรรพคุณ / วิธีใช้ / หมายเหตุ</Label>
              <Textarea
                id="note"
                placeholder="เช่น บรรเทาอาการท้องอืด ขับลม รับประทานครั้งละ 2 แคปซูล ก่อนอาหาร"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="terracotta"
                disabled={submitting}
              >
                {submitting ? "กำลังบันทึก..." : "✓ บันทึกข้อมูลยา"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
