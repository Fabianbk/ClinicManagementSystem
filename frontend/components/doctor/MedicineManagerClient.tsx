"use client";

import { useState, useMemo } from "react";
import type {
  MedicineResponseDTO,
  PageResponse,
  MedicineRequestDTO,
  MedicineLotRequestDTO,
  MedicineLotResponseDTO,
  StockAdjustmentRequestDTO,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-field";
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
  PackagePlus,
  Calendar,
  Layers,
  SlidersHorizontal,
  Clock,
  ShieldAlert,
  Ban,
  RotateCcw,
} from "lucide-react";

interface MedicineManagerClientProps {
  initialData: PageResponse<MedicineResponseDTO> | null;
}

/** หมวดหมู่ยามาตรฐาน 11 หมวดหมู่ตามที่คลินิกมี */
const CLINIC_DEFAULT_CATEGORIES = [
  "ยาเม็ดแผนโบราณ",
  "ยาชนิดใช้ภายนอก",
  "ยาดมสมุนไพร",
  "ยาลูกกลอน",
  "ชาชง",
  "ยาผงใช้ภายนอก",
  "สินค้าเพื่อสุขภาพ",
  "ยาผงรับประทาน",
  "ยาแคปซูล (กระป๋อง)",
  "ยาแคปซูล (เม็ด)",
  "สมุนไพรแห้ง",
];

const UNIT_TYPE_SUGGESTIONS = [
  "เม็ด",
  "แคปซูล",
  "ขวด",
  "ซอง",
  "กระป๋อง",
  "ตลับ",
  "หลอด",
  "ชิ้น",
  "ห่อ",
];

export function MedicineManagerClient({ initialData }: MedicineManagerClientProps) {
  const [medicines, setMedicines] = useState<MedicineResponseDTO[]>(
    initialData?.content ?? []
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LOW_STOCK" | "EXPIRING_SOON" | "EXPIRED">("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "DISCONTINUED">("ALL");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReceiveStockModalOpen, setIsReceiveStockModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isViewLotsModalOpen, setIsViewLotsModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Active item states
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineResponseDTO | null>(null);
  const [activeMedicineLots, setActiveMedicineLots] = useState<MedicineLotResponseDTO[]>([]);
  const [loadingLots, setLoadingLots] = useState(false);

  // Form states: Create / Edit Medicine
  const [medName, setMedName] = useState("");
  const [medCategory, setMedCategory] = useState("ยาแคปซูล (เม็ด)");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [unitType, setUnitType] = useState("เม็ด");
  const [note, setNote] = useState("");
  const [medIsActive, setMedIsActive] = useState(true);

  // Form states: Receive Stock (Add Lot)
  const [receiveMedId, setReceiveMedId] = useState<number>(0);
  const [lotNumber, setLotNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [quantityReceived, setQuantityReceived] = useState<number>(100);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [lotNote, setLotNote] = useState("");

  // Form states: Adjust Stock
  const [adjustMedId, setAdjustMedId] = useState<number>(0);
  const [adjustLotId, setAdjustLotId] = useState<number | undefined>(undefined);
  const [newQuantityRemaining, setNewQuantityRemaining] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("นับสต็อกจริง (Physical Count)");
  const [adjustNote, setAdjustNote] = useState("");

  // Dynamic Categories (union of defaults + whatever is in DB)
  const availableCategories = useMemo(() => {
    const set = new Set<string>(CLINIC_DEFAULT_CATEGORIES);
    medicines.forEach((m) => {
      if (m.medicineCategory && m.medicineCategory.trim()) {
        set.add(m.medicineCategory.trim());
      }
    });
    return Array.from(set);
  }, [medicines]);

  // Reload medicines list
  const refreshMedicines = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/medicines?page=0&size=200");
      if (!res.ok) throw new Error("ไม่สามารถโหลดรายการยาได้");
      const data: PageResponse<MedicineResponseDTO> = await res.json();
      setMedicines(data.content ?? []);
    } catch (err: any) {
      setErrorMsg(err.message || "ไม่สามารถโหลดรายการยาได้");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Lots for a specific medicine
  const loadLotsForMedicine = async (medicineId: number) => {
    try {
      setLoadingLots(true);
      const res = await fetch(`/api/medicine-lots/medicine/${medicineId}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดรายการล็อตยาได้");
      const data: MedicineLotResponseDTO[] = await res.json();
      setActiveMedicineLots(data);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการโหลดล็อตยา");
    } finally {
      setLoadingLots(false);
    }
  };

  // 1. Open Create Medicine Modal
  const openCreateModal = () => {
    setMedName("");
    setMedCategory("ยาแคปซูล (เม็ด)");
    setUnitPrice(0);
    setUnitType("เม็ด");
    setNote("");
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsCreateModalOpen(true);
  };

  // 2. Open Edit Medicine Modal (Master info only)
  const openEditModal = (med: MedicineResponseDTO) => {
    setSelectedMedicine(med);
    setMedName(med.medicineName);
    setMedCategory(med.medicineCategory || "ยาแคปซูล (เม็ด)");
    setUnitPrice(med.unitPrice ?? 0);
    setUnitType(med.unitType || "เม็ด");
    setNote(med.note || "");
    setMedIsActive(med.isActive !== false);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEditModalOpen(true);
  };

  // 3. Open Receive Stock Modal
  const openReceiveStockModal = (med?: MedicineResponseDTO) => {
    const targetMed = med || (medicines.length > 0 ? medicines[0] : null);
    setReceiveMedId(targetMed ? targetMed.medicineId : 0);
    // Generate suggested lot number like LOT-YYMMDD-01
    const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    setLotNumber(`LOT${todayStr}-01`);
    // Default expiry date: 1 year from now
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setExpiryDate(nextYear.toISOString().slice(0, 10));
    setManufactureDate(new Date().toISOString().slice(0, 10));
    setQuantityReceived(100);
    setCostPrice(0);
    setLotNote("");
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsReceiveStockModalOpen(true);
  };

  // 4. Open Adjust Stock Modal
  const openAdjustStockModal = (med: MedicineResponseDTO, lot?: MedicineLotResponseDTO) => {
    setSelectedMedicine(med);
    setAdjustMedId(med.medicineId);
    setAdjustLotId(lot ? lot.lotId : undefined);
    setNewQuantityRemaining(lot ? lot.quantityRemaining : med.stockRemaining ?? 0);
    setAdjustReason(lot && lot.expired ? "ตัดจำหน่ายยาหมดอายุ (Expired Write-off)" : "นับสต็อกจริง (Physical Count)");
    setAdjustNote("");
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsAdjustStockModalOpen(true);
  };

  // 5. Open View Lots Modal
  const openViewLotsModal = async (med: MedicineResponseDTO) => {
    setSelectedMedicine(med);
    setErrorMsg(null);
    setIsViewLotsModalOpen(true);
    await loadLotsForMedicine(med.medicineId);
  };

  // Submit Create Medicine
  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) {
      setErrorMsg("กรุณากรอกชื่อยาสมุนไพร");
      return;
    }

    const payload: MedicineRequestDTO = {
      medicineName: medName.trim(),
      medicineCategory: medCategory.trim() || undefined,
      unitPrice: Number(unitPrice),
      unitType: unitType.trim() || undefined,
      note: note.trim() || undefined,
      stockRemaining: 0,
      stockReceived: 0,
      stockIssued: 0,
      stockBroughtForward: 0,
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "ไม่สามารถเพิ่มยาสมุนไพรได้");
      }
      const created: MedicineResponseDTO = await res.json();
      setSuccessMsg(`เพิ่มยา "${created.medicineName}" สำเร็จแล้ว คุณสามารถกดปุ่ม "รับยาเข้าคลัง" เพื่อเพิ่มล็อตยาได้ทันที`);
      setIsCreateModalOpen(false);
      refreshMedicines();
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Medicine Master Info
  const handleEditMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    if (!medName.trim()) {
      setErrorMsg("กรุณากรอกชื่อยา");
      return;
    }

    const payload: MedicineRequestDTO = {
      medicineName: medName.trim(),
      medicineCategory: medCategory.trim() || undefined,
      unitPrice: Number(unitPrice),
      unitType: unitType.trim() || undefined,
      note: note.trim() || undefined,
      isActive: medIsActive,
    };

    try {
      setSubmitting(true);
      const res = await fetch(`/api/medicines/${selectedMedicine.medicineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "ไม่สามารถอัปเดตข้อมูลยาได้");
      }
      setSuccessMsg(`อัปเดตข้อมูลยา "${payload.medicineName}" เรียบร้อยแล้ว`);
      setIsEditModalOpen(false);
      refreshMedicines();
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Receive Stock Lot
  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveMedId) {
      toast.error("กรุณาเลือกยาสมุนไพรที่ต้องการรับเข้าคลัง");
      setErrorMsg("กรุณาเลือกยาสมุนไพรที่ต้องการรับเข้าคลัง");
      return;
    }
    if (!lotNumber.trim()) {
      toast.error("กรุณาระบุเลขล็อตยา");
      setErrorMsg("กรุณาระบุเลขล็อตยา");
      return;
    }
    if (!expiryDate) {
      toast.error("กรุณาระบุวันหมดอายุ");
      setErrorMsg("กรุณาระบุวันหมดอายุ");
      return;
    }
    if (quantityReceived <= 0) {
      toast.error("จำนวนรับเข้าต้องมากกว่า 0");
      setErrorMsg("จำนวนรับเข้าต้องมากกว่า 0");
      return;
    }

    const payload: MedicineLotRequestDTO = {
      medicineId: Number(receiveMedId),
      lotNumber: lotNumber.trim(),
      expiryDate,
      manufactureDate: manufactureDate || undefined,
      quantityReceived: Number(quantityReceived),
      costPrice: costPrice > 0 ? Number(costPrice) : undefined,
      note: lotNote.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/medicine-lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "ไม่สามารถรับยาเข้าคลังได้");
      }
      toast.success(`รับยาล็อต "${payload.lotNumber}" จำนวน ${payload.quantityReceived} หน่วยเข้าคลังเรียบร้อยแล้ว`);
      setSuccessMsg(`รับยาล็อต "${payload.lotNumber}" จำนวน ${payload.quantityReceived} หน่วยเข้าคลังเรียบร้อยแล้ว`);
      setIsReceiveStockModalOpen(false);
      refreshMedicines();
      if (selectedMedicine && selectedMedicine.medicineId === receiveMedId) {
        loadLotsForMedicine(receiveMedId);
      }
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการรับยาเข้าคลัง");
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการรับยาเข้าคลัง");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Stock Adjustment
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustMedId) return;

    const payload: StockAdjustmentRequestDTO = {
      medicineId: adjustMedId,
      lotId: adjustLotId,
      newQuantityRemaining: Number(newQuantityRemaining),
      reason: adjustReason,
      note: adjustNote.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/medicine-lots/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "ไม่สามารถปรับปรุงยอดสต็อกได้");
      }
      setSuccessMsg("ปรับปรุงยอดสต็อกเรียบร้อยแล้ว");
      setIsAdjustStockModalOpen(false);
      refreshMedicines();
      if (selectedMedicine) {
        loadLotsForMedicine(selectedMedicine.medicineId);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการปรับปรุงยอดสต็อก");
    } finally {
      setSubmitting(false);
    }
  };

  // Deactivate Medicine Master (Soft delete)
  const handleDeactivateMedicine = async (medicineId: number, name: string) => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการระงับการใช้/เลิกจำหน่ายยา "${name}"?\n\n(ยานี้จะไม่สามารถเลือกสั่งจ่ายในการรักษาใหม่ได้ แต่ข้อมูลสต็อก ล็อตยา และประวัติการรักษาเดิมจะยังคงอยู่ครบถ้วน)`
      )
    )
      return;

    try {
      setLoading(true);
      const res = await fetch(`/api/medicines/${medicineId}`, { method: "DELETE" });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "ไม่สามารถระงับการใช้ยาได้");
      }
      toast.success(`ระงับการใช้ยา "${name}" เรียบร้อยแล้ว`);
      setSuccessMsg(`ระงับการใช้ยา "${name}" เรียบร้อยแล้ว (เปลี่ยนสถานะเป็นเลิกจำหน่าย)`);
      refreshMedicines();
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการระงับการใช้ยา");
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการระงับการใช้ยา");
    } finally {
      setLoading(false);
    }
  };

  // Reactivate / Toggle Medicine status
  const handleToggleMedicine = async (medicineId: number, name: string, willActivate: boolean) => {
    const actionText = willActivate ? "เปิดใช้งานยา" : "ระงับการใช้ยา";
    if (!confirm(`ยืนยันการ${actionText} "${name}"?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/medicines/${medicineId}/toggle-status`, { method: "PATCH" });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `ไม่สามารถ${actionText}ได้`);
      }
      toast.success(`${actionText} "${name}" เรียบร้อยแล้ว`);
      setSuccessMsg(`${actionText} "${name}" เรียบร้อยแล้ว`);
      refreshMedicines();
    } catch (err: any) {
      toast.error(err.message || `เกิดข้อผิดพลาดในการ${actionText}`);
      setErrorMsg(err.message || `เกิดข้อผิดพลาดในการ${actionText}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete Lot
  const handleDeleteLot = async (lotId: number, lotNum: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบล็อต "${lotNum}"? (จะสามารถลบได้เฉพาะล็อตที่ยังไม่เคยถูกสั่งจ่าย)`)) return;

    try {
      setLoadingLots(true);
      const res = await fetch(`/api/medicine-lots/${lotId}`, { method: "DELETE" });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "ไม่สามารถลบล็อตยาได้ (อาจมียานี้ในประวัติการรักษา)");
      }
      setSuccessMsg(`ลบล็อต "${lotNum}" เรียบร้อยแล้ว`);
      if (selectedMedicine) {
        loadLotsForMedicine(selectedMedicine.medicineId);
      }
      refreshMedicines();
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการลบล็อต");
    } finally {
      setLoadingLots(false);
    }
  };

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      // Availability filter
      if (activeFilter === "ACTIVE" && med.isActive === false) {
        return false;
      }
      if (activeFilter === "DISCONTINUED" && med.isActive !== false) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "ทั้งหมด" && med.medicineCategory !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === "LOW_STOCK" && (med.stockRemaining ?? 0) > 20) {
        return false;
      }
      if (statusFilter === "EXPIRING_SOON" && !med.hasExpiringSoon) {
        return false;
      }
      if (statusFilter === "EXPIRED" && !med.hasExpired) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = med.medicineName.toLowerCase().includes(q);
        const matchCat = med.medicineCategory?.toLowerCase().includes(q);
        const matchNote = med.note?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchNote) return false;
      }
      return true;
    });
  }, [medicines, activeFilter, selectedCategory, statusFilter, searchQuery]);

  // Counts
  const activeCount = medicines.filter((m) => m.isActive !== false).length;
  const discontinuedCount = medicines.filter((m) => m.isActive === false).length;
  const lowStockCount = medicines.filter((m) => (m.stockRemaining ?? 0) <= 20).length;
  const expiringSoonCount = medicines.filter((m) => m.hasExpiringSoon).length;
  const expiredCount = medicines.filter((m) => m.hasExpired).length;

  return (
    <div className="space-y-6 pb-20 font-body text-clinic-ink">
      {/* Datalist for Medicine Categories */}
      <datalist id="clinic-categories-list">
        {availableCategories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* Datalist for Unit Types */}
      <datalist id="clinic-unit-types-list">
        {UNIT_TYPE_SUGGESTIONS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      <PageHeader
        icon={<Pill className="w-5 h-5 text-clinic-primary" />}
        title="คลังยาสมุนไพรและเวชภัณฑ์ (Pharmacy & Inventory)"
        subtitle="ระบบบริหารจัดการสต็อกตำรับยาไทย การรับล็อตยา วันหมดอายุ และการตัดจ่ายตามมาตรฐาน FIFO"
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
              variant="outline"
              size="sm"
              onClick={() => openReceiveStockModal()}
              className="gap-1.5 border-clinic-primary text-clinic-primary hover:bg-clinic-primary-soft/30 font-semibold"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ รับยาเข้าคลัง / เพิ่มล็อต</span>
            </Button>
            <Button
              type="button"
              variant="terracotta"
              size="sm"
              onClick={openCreateModal}
              className="gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มตำรับยาใหม่</span>
            </Button>
          </div>
        }
      />

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium flex items-center justify-between animate-fadeIn">
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
        <div className="p-4 rounded-control bg-clinic-success-bg border border-clinic-success text-clinic-success text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs underline cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:border-clinic-primary ${
            statusFilter === "ALL" ? "ring-2 ring-clinic-primary" : ""
          }`}
          onClick={() => setStatusFilter("ALL")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-clinic-ink-soft">รายการยาทั้งหมด</p>
              <Layers className="w-4 h-4 text-clinic-primary" />
            </div>
            <p className="text-2xl font-bold font-display text-clinic-primary-deep mt-1">
              {medicines.length} <span className="text-xs font-normal text-clinic-ink-soft">รายการ</span>
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:border-amber-500 ${
            statusFilter === "LOW_STOCK" ? "ring-2 ring-amber-500 bg-amber-50/40" : ""
          }`}
          onClick={() => setStatusFilter(statusFilter === "LOW_STOCK" ? "ALL" : "LOW_STOCK")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-amber-800">ยาใกล้หมด (≤ 20)</p>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold font-display text-amber-900 mt-1">
              {lowStockCount} <span className="text-xs font-normal text-clinic-ink-soft">รายการ</span>
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:border-orange-500 ${
            statusFilter === "EXPIRING_SOON" ? "ring-2 ring-orange-500 bg-orange-50/40" : ""
          }`}
          onClick={() => setStatusFilter(statusFilter === "EXPIRING_SOON" ? "ALL" : "EXPIRING_SOON")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-orange-800">ใกล้หมดอายุ (≤ 60 วัน)</p>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold font-display text-orange-900 mt-1">
              {expiringSoonCount} <span className="text-xs font-normal text-clinic-ink-soft">รายการ</span>
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:border-rose-500 ${
            statusFilter === "EXPIRED" ? "ring-2 ring-rose-500 bg-rose-50/40" : ""
          }`}
          onClick={() => setStatusFilter(statusFilter === "EXPIRED" ? "ALL" : "EXPIRED")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-rose-800">ยาหมดอายุ (บล็อกจ่าย)</p>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold font-display text-rose-900 mt-1">
              {expiredCount} <span className="text-xs font-normal text-clinic-ink-soft">รายการ</span>
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
              placeholder="ค้นหาชื่อตำรับยา, หมวดหมู่, สรรพคุณ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-control border border-clinic-border bg-white py-1.5 px-3 text-xs text-clinic-ink focus:border-clinic-primary focus:outline-none focus:ring-1 focus:ring-clinic-primary"
            >
              <option value="ทั้งหมด">หมวดหมู่: ทั้งหมด ({availableCategories.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-52">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
              className="w-full rounded-control border border-clinic-border bg-white py-1.5 px-3 text-xs text-clinic-ink focus:border-clinic-primary focus:outline-none focus:ring-1 focus:ring-clinic-primary"
            >
              <option value="ALL">สถานะจำหน่าย: ทั้งหมด ({medicines.length})</option>
              <option value="ACTIVE">เฉพาะจำหน่ายปกติ ({activeCount})</option>
              <option value="DISCONTINUED">เลิกจำหน่ายแล้ว ({discontinuedCount})</option>
            </select>
          </div>

          {statusFilter !== "ALL" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("ALL")}
              className="text-xs text-clinic-primary h-8"
            >
              ล้างตัวกรองสถานะ
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Medicine Table */}
      {filteredMedicines.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">รหัส</TableHead>
              <TableHead>ชื่อยาสมุนไพร / ตำรับยา</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead className="text-right">ราคา/หน่วย</TableHead>
              <TableHead className="text-center">คงเหลือรวม (Stock)</TableHead>
              <TableHead className="text-center">สถานะล็อต & วันหมดอายุ</TableHead>
              <TableHead className="text-right">จัดการคลังยา</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.map((med) => {
              const remaining = med.stockRemaining ?? 0;
              const isLowStock = remaining <= 20;
              const lotCount = med.activeLotCount ?? (med.lots ? med.lots.length : 0);

              return (
                <TableRow key={med.medicineId}>
                  <TableCell className="font-mono text-xs text-clinic-ink-soft">
                    #{med.medicineId}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold block ${
                            med.isActive === false
                              ? "text-clinic-ink-muted line-through opacity-80"
                              : "text-clinic-ink"
                          }`}
                        >
                          {med.medicineName}
                        </span>
                        {med.isActive === false ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                            เลิกจำหน่าย
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            จำหน่ายปกติ
                          </span>
                        )}
                      </div>
                      {med.note && (
                        <span className="text-xs text-clinic-ink-soft block line-clamp-1">
                          {med.note}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs bg-slate-50 text-clinic-ink-muted">
                      {med.medicineCategory || "ไม่ระบุหมวดหมู่"}
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
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      {med.hasExpired && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <ShieldAlert className="w-3 h-3" />
                          มีล็อตหมดอายุ
                        </span>
                      )}
                      {med.hasExpiringSoon && !med.hasExpired && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          ใกล้หมดอายุ (≤60 วัน)
                        </span>
                      )}
                      {!med.hasExpired && !med.hasExpiringSoon && (
                        <span className="text-xs text-clinic-ink-soft">
                          {lotCount > 0 ? (
                            med.earliestExpiryDate ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <Calendar className="w-3 h-3" />
                                หมดอายุ {med.earliestExpiryDate}
                              </span>
                            ) : (
                              `${lotCount} ล็อต`
                            )
                          ) : (
                            <span className="text-amber-700 font-medium">ยังไม่มีล็อตยา</span>
                          )}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openReceiveStockModal(med)}
                        className="h-7 px-2 text-xs text-clinic-primary border-clinic-primary/30 hover:bg-clinic-primary-soft/30 gap-1"
                        title="รับยาเข้าคลังเป็นล็อตใหม่"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>รับเข้า</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewLotsModal(med)}
                        className="h-7 px-2 text-xs text-clinic-ink gap-1"
                        title="ดูประวัติทุกล็อต"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>ล็อต ({lotCount})</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openAdjustStockModal(med)}
                        className="h-7 px-2 text-xs text-amber-700 hover:bg-amber-50 gap-1"
                        title="ปรับปรุงยอดสต็อก / ตัดจำหน่าย"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>ปรับสต็อก</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(med)}
                        className="h-7 px-2 text-xs text-clinic-primary gap-1"
                        title="แก้ไขชื่อยา สรรพคุณ ราคา สถานะ"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </Button>
                      {med.isActive === false ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleMedicine(med.medicineId, med.medicineName, true)}
                          className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50 gap-1 font-semibold"
                          title="เปิดใช้งาน/นำกลับมาจำหน่าย"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>เปิดใช้งาน</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateMedicine(med.medicineId, med.medicineName)}
                          className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 gap-1"
                          title="ระงับการใช้/เลิกจำหน่าย (Soft Delete)"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>ระงับการใช้</span>
                        </Button>
                      )}
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
          description="ท่านสามารถกดปุ่มเพิ่มตำรับยาใหม่ หรือปรับเปลี่ยนตัวกรองหมวดหมู่"
          action={
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setStatusFilter("ALL")}>
                ล้างตัวกรอง
              </Button>
              <Button type="button" variant="terracotta" size="sm" onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-1" />
                <span>+ เพิ่มตำรับยาใหม่</span>
              </Button>
            </div>
          }
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. Modal: เพิ่มตำรับยาใหม่ (Create Medicine Master) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มตำรับยาสมุนไพร / เวชภัณฑ์ใหม่</DialogTitle>
            <DialogDescription>
              ลงทะเบียนข้อมูลตำรับยา หมวดหมู่ ราคาขายต่อหน่วย และหน่วยนับ (รับยาเข้าล็อตได้ในขั้นตอนถัดไป)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateMedicine} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name" required>
                ชื่อยาสมุนไพร / ตำรับยา
              </Label>
              <Input
                id="create-name"
                required
                placeholder="เช่น ขมิ้นชันแคปซูล, ยาหอมนวโกฐ, ยาธาตุบรรจบ"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-category" required>
                  หมวดหมู่ยา
                </Label>
                <Input
                  id="create-category"
                  list="clinic-categories-list"
                  required
                  placeholder="เลือกหรือพิมพ์หมวดหมู่..."
                  value={medCategory}
                  onChange={(e) => setMedCategory(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-unitType" required>
                  หน่วยนับ (Unit)
                </Label>
                <Input
                  id="create-unitType"
                  list="clinic-unit-types-list"
                  required
                  placeholder="เช่น เม็ด, แคปซูล, ขวด"
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-price" required>
                ราคาขายต่อหน่วย (บาท)
              </Label>
              <Input
                id="create-price"
                type="number"
                min={0}
                step={0.5}
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-note">สรรพคุณ / วิธีรับประทาน / หมายเหตุ</Label>
              <Textarea
                id="create-note"
                placeholder="เช่น บรรเทาอาการท้องอืด แน่น จุกเสียด รับประทานครั้งละ 2 แคปซูล ก่อนอาหาร 3 เวลา"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" variant="terracotta" disabled={submitting}>
                {submitting ? "กำลังบันทึก..." : "✓ บันทึกตำรับยา"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 2. Modal: แก้ไขข้อมูลทั่วไปของยา (Edit Medicine Info) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลตำรับยา: {selectedMedicine?.medicineName}</DialogTitle>
            <DialogDescription>
              แก้ไขชื่อยา หมวดหมู่ ราคาต่อหน่วย และสรรพคุณ (หากต้องการปรับสต็อกกรุณาใช้ปุ่มปรับปรุงสต็อก)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditMedicine} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" required>
                ชื่อยาสมุนไพร / ตำรับยา
              </Label>
              <Input
                id="edit-name"
                required
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-category" required>
                  หมวดหมู่ยา
                </Label>
                <Input
                  id="edit-category"
                  list="clinic-categories-list"
                  required
                  value={medCategory}
                  onChange={(e) => setMedCategory(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-unitType" required>
                  หน่วยนับ (Unit)
                </Label>
                <Input
                  id="edit-unitType"
                  list="clinic-unit-types-list"
                  required
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-price" required>
                ราคาขายต่อหน่วย (บาท)
              </Label>
              <Input
                id="edit-price"
                type="number"
                min={0}
                step={0.5}
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-note">สรรพคุณ / วิธีรับประทาน / หมายเหตุ</Label>
              <Textarea
                id="edit-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="pt-2 border-t border-clinic-line">
              <label className="flex items-center gap-2 text-xs font-semibold text-clinic-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={medIsActive}
                  onChange={(e) => setMedIsActive(e.target.checked)}
                  className="rounded border-clinic-line text-clinic-primary focus:ring-clinic-primary/20 h-4 w-4"
                />
                <span>สถานะจำหน่ายปกติ (เปิดให้สามารถเลือกสั่งจ่ายยาได้ในระบบ)</span>
              </label>
              <p className="text-[11px] text-clinic-ink-muted pl-6 mt-0.5">
                หากยกเลิกการเลือก ยานี้จะถูกตั้งเป็น "เลิกจำหน่าย" และไม่แสดงในหน้าห้องตรวจรักษา
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" variant="terracotta" disabled={submitting}>
                {submitting ? "กำลังบันทึก..." : "✓ บันทึกการแก้ไข"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 3. Modal: รับยาเข้าคลัง / เพิ่มล็อตใหม่ (+ Receive Stock Lot) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isReceiveStockModalOpen} onOpenChange={setIsReceiveStockModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-clinic-primary" />
              <span>รับยาเข้าคลัง / เพิ่มล็อตใหม่</span>
            </DialogTitle>
            <DialogDescription>
              บันทึกการรับยาสมุนไพรเข้าคลัง ระบุเลขล็อตและวันหมดอายุ ระบบจะเพิ่มยอดคงเหลือให้อัตโนมัติ
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReceiveStock} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="receive-med" required>
                เลือกยาสมุนไพร
              </Label>
              <select
                id="receive-med"
                required
                value={receiveMedId}
                onChange={(e) => setReceiveMedId(Number(e.target.value))}
                className="w-full rounded-control border border-clinic-border bg-white py-2 px-3 text-xs text-clinic-ink focus:border-clinic-primary focus:outline-none focus:ring-1 focus:ring-clinic-primary"
              >
                <option value={0} disabled>
                  -- กรุณาเลือกยา --
                </option>
                {medicines.map((m) => (
                  <option key={m.medicineId} value={m.medicineId}>
                    {m.medicineName} ({m.medicineCategory || "ไม่ระบุหมวด"}) - คงเหลือปัจจุบัน: {m.stockRemaining ?? 0} {m.unitType}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="receive-lot" required>
                เลขล็อต / เลขที่รุ่นการผลิต (Lot Number)
              </Label>
              <Input
                id="receive-lot"
                required
                placeholder="เช่น LOT670901, BATCH-2026-A"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="วันหมดอายุ (Expiry Date)"
                required
                id="receive-exp"
              >
                <DatePicker
                  value={expiryDate}
                  onChange={(val) => setExpiryDate(val)}
                  placeholder="เลือกวันหมดอายุ"
                />
              </FormField>

              <FormField
                label="วันที่ผลิต (Mfg Date)"
                id="receive-mfg"
              >
                <DatePicker
                  value={manufactureDate}
                  onChange={(val) => setManufactureDate(val)}
                  placeholder="เลือกวันที่ผลิต"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="receive-qty" required>
                  จำนวนที่รับเข้า (Quantity)
                </Label>
                <Input
                  id="receive-qty"
                  type="number"
                  min={1}
                  required
                  value={quantityReceived}
                  onChange={(e) => setQuantityReceived(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receive-cost">
                  ราคาทุนต่อหน่วย (บาท)
                </Label>
                <Input
                  id="receive-cost"
                  type="number"
                  min={0}
                  step={0.5}
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="receive-note">หมายเหตุการรับเข้า</Label>
              <Input
                id="receive-note"
                placeholder="เช่น รับมอบจากองค์การเภสัชกรรม, ตัวแทนจำหน่าย"
                value={lotNote}
                onChange={(e) => setLotNote(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReceiveStockModalOpen(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" variant="terracotta" disabled={submitting}>
                {submitting ? "กำลังบันทึก..." : "✓ ยืนยันรับยาเข้าคลัง"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 4. Modal: ปรับปรุงยอดสต็อก (Stock Adjustment) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isAdjustStockModalOpen} onOpenChange={setIsAdjustStockModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-600" />
              <span>ปรับปรุงยอดสต็อก: {selectedMedicine?.medicineName}</span>
            </DialogTitle>
            <DialogDescription>
              ปรับยอดคงเหลือเมื่อตรวจนับจริงไม่ตรง หรือตัดจำหน่ายยาชำรุด/แตกหัก/หมดอายุ พร้อมบันทึกเหตุผล
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdjustStock} className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-control text-xs space-y-1">
              <p className="font-semibold text-clinic-ink">
                ยาสมุนไพร: {selectedMedicine?.medicineName}
              </p>
              <p className="text-clinic-ink-soft">
                ยอดคงเหลือรวมในระบบปัจจุบัน:{" "}
                <span className="font-mono font-bold text-clinic-primary">
                  {selectedMedicine?.stockRemaining ?? 0} {selectedMedicine?.unitType}
                </span>
              </p>
              {adjustLotId && (
                <p className="text-amber-800 font-medium">
                  ปรับเฉพาะล็อต ID #{adjustLotId}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adjust-reason" required>
                สาเหตุการปรับปรุงยอด
              </Label>
              <select
                id="adjust-reason"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full rounded-control border border-clinic-border bg-white py-2 px-3 text-xs text-clinic-ink focus:border-clinic-primary focus:outline-none focus:ring-1 focus:ring-clinic-primary"
              >
                <option value="นับสต็อกจริง (Physical Count)">นับสต็อกจริง (Physical Count)</option>
                <option value="ยาชำรุด/แตกหัก (Damaged)">ยาชำรุด / แตกหัก / เสื่อมสภาพ (Damaged)</option>
                <option value="ตัดจำหน่ายยาหมดอายุ (Expired Write-off)">ตัดจำหน่ายยาหมดอายุ (Expired Write-off)</option>
                <option value="ยาหาย/ไม่พบ (Lost)">ยาหาย / ตรวจนับไม่พบ (Lost)</option>
                <option value="ปรับปรุงยอดตั้งต้น (Initial Balance)">ปรับปรุงยอดตั้งต้น (Initial Balance)</option>
                <option value="อื่นๆ (Other)">อื่นๆ (Other)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adjust-qty" required>
                จำนวนคงเหลือจริงใหม่ (New Remaining)
              </Label>
              <Input
                id="adjust-qty"
                type="number"
                min={0}
                required
                value={newQuantityRemaining}
                onChange={(e) => setNewQuantityRemaining(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adjust-note">หมายเหตุประกอบการปรับยอด</Label>
              <Textarea
                id="adjust-note"
                placeholder="ระบุรายละเอียดเพิ่มเติม เช่น ตรวจนับประจำเดือนกันยายน, ขวดแตกชำรุด 2 ชิ้น"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustStockModalOpen(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" variant="terracotta" disabled={submitting}>
                {submitting ? "กำลังบันทึก..." : "✓ บันทึกการปรับยอด"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 5. Modal: ดูประวัติล็อตยา (View Lots Detail) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={isViewLotsModalOpen} onOpenChange={setIsViewLotsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-clinic-primary" />
                <span>ประวัติล็อตยา: {selectedMedicine?.medicineName}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openReceiveStockModal(selectedMedicine || undefined)}
                className="gap-1 text-xs"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>+ รับล็อตใหม่</span>
              </Button>
            </DialogTitle>
            <DialogDescription>
              แสดงประวัติการรับเข้า วันหมดอายุ และยอดคงเหลือแยกรายล็อต (ระบบตัดจ่ายอัตโนมัติตามล็อตที่หมดอายุก่อน - FIFO)
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3">
            {loadingLots ? (
              <div className="p-8 text-center text-xs text-clinic-ink-soft">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-clinic-primary" />
                กำลังโหลดรายการล็อตยา...
              </div>
            ) : activeMedicineLots.length > 0 ? (
              <div className="border border-clinic-border rounded-control overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-clinic-border text-clinic-ink-soft">
                    <tr>
                      <th className="p-2.5">เลขล็อต</th>
                      <th className="p-2.5">วันรับเข้า</th>
                      <th className="p-2.5">วันหมดอายุ</th>
                      <th className="p-2.5 text-center">รับ / คงเหลือ</th>
                      <th className="p-2.5 text-center">สถานะ</th>
                      <th className="p-2.5 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-clinic-border">
                    {activeMedicineLots.map((lot) => {
                      return (
                        <tr
                          key={lot.lotId}
                          className={lot.expired ? "bg-rose-50/50" : lot.expiringSoon ? "bg-orange-50/50" : ""}
                        >
                          <td className="p-2.5 font-mono font-semibold text-clinic-ink">
                            {lot.lotNumber}
                            {lot.note && (
                              <span className="block text-[10px] text-clinic-ink-muted font-normal">
                                {lot.note}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-clinic-ink-soft">
                            {lot.receivedDate}
                          </td>
                          <td className="p-2.5">
                            <span className={`font-medium ${lot.expired ? "text-rose-700 font-bold" : lot.expiringSoon ? "text-orange-700 font-bold" : "text-clinic-ink"}`}>
                              {lot.expiryDate}
                            </span>
                            {lot.daysUntilExpiry < 0 ? (
                              <span className="block text-[10px] text-rose-600">
                                หมดอายุแล้ว {Math.abs(lot.daysUntilExpiry)} วัน
                              </span>
                            ) : (
                              <span className="block text-[10px] text-clinic-ink-soft">
                                เหลืออีก {lot.daysUntilExpiry} วัน
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            <span className="text-clinic-ink-soft">{lot.quantityReceived}</span>
                            {" / "}
                            <span className="font-bold text-clinic-primary-deep">
                              {lot.quantityRemaining}
                            </span>{" "}
                            {selectedMedicine?.unitType}
                          </td>
                          <td className="p-2.5 text-center">
                            {lot.expired ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                หมดอายุ
                              </span>
                            ) : lot.expiringSoon ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                                ใกล้หมด
                              </span>
                            ) : lot.quantityRemaining === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                จ่ายหมด
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                พร้อมจ่าย
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (selectedMedicine) {
                                    openAdjustStockModal(selectedMedicine, lot);
                                  }
                                }}
                                className="h-6 px-1.5 text-[11px] text-amber-700 hover:bg-amber-100/50"
                                title="ปรับยอดล็อตนี้"
                              >
                                ปรับยอด
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLot(lot.lotId, lot.lotNumber)}
                                className="h-6 px-1.5 text-[11px] text-rose-600 hover:bg-rose-100/50"
                                title="ลบล็อต"
                              >
                                ลบ
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-clinic-ink-soft bg-slate-50 border border-dashed border-clinic-border rounded-control space-y-2">
                <p>ยานี้ยังไม่มีการบันทึกประวัติการรับเข้าเป็นล็อต</p>
                <Button
                  type="button"
                  variant="terracotta"
                  size="sm"
                  onClick={() => openReceiveStockModal(selectedMedicine || undefined)}
                  className="gap-1 text-xs"
                >
                  <PackagePlus className="w-3.5 h-3.5" />
                  <span>+ รับยาล็อตแรกเข้าคลัง</span>
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewLotsModalOpen(false)}
            >
              ปิดหน้าต่าง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
