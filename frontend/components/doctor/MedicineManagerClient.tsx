"use client";

import { useState } from "react";
import type { MedicineResponseDTO, PageResponse, MedicineRequestDTO } from "@/lib/types";

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
      setErrorMsg("กรุณาระบุชื่อยา / เวชภัณฑ์");
      return;
    }
    if (unitPrice < 0) {
      setErrorMsg("ราคาต่อหน่วยต้องไม่ติดลบ");
      return;
    }

    const payload: MedicineRequestDTO = {
      medicineName: medicineName.trim(),
      medicineCategory: medicineCategory.trim() || undefined,
      unitPrice: Number(unitPrice),
      unitType: unitType.trim() || undefined,
      stockRemaining: Number(stockRemaining ?? 0),
      stockBroughtForward: Number(stockBroughtForward ?? 0),
      stockReceived: Number(stockReceived ?? 0),
      stockIssued: Number(stockIssued ?? 0),
      note: note.trim() || undefined,
    };

    try {
      setSubmitting(true);
      const isEdit = !!editingMedicine;
      const url = isEdit ? `/api/medicines/${editingMedicine.medicineId}` : "/api/medicines";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.errors?.length ? errJson.errors.join(", ") : errJson.message || "ไม่สามารถบันทึกข้อมูลยาได้";
        throw new Error(msg);
      }

      setSuccessMsg(isEdit ? `แก้ไขข้อมูลยา "${medicineName}" เรียบร้อยแล้ว` : `เพิ่มยาใหม่ "${medicineName}" สำเร็จแล้ว`);
      setIsModalOpen(false);
      refreshMedicines();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter medicines
  const filteredMedicines = medicines.filter((med) => {
    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = med.medicineName?.toLowerCase().includes(q);
      const matchCat = med.medicineCategory?.toLowerCase().includes(q);
      const matchNote = med.note?.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchNote) return false;
    }
    // Category filter
    if (selectedCategory !== "ทั้งหมด") {
      if (!med.medicineCategory?.includes(selectedCategory.replace(/ \(.+\)/, ""))) {
        return false;
      }
    }
    // Low stock filter (stock <= 10)
    if (showLowStockOnly) {
      const stock = med.stockRemaining ?? 0;
      if (stock > 10) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalCount = medicines.length;
  const lowStockCount = medicines.filter((m) => (m.stockRemaining ?? 0) <= 10).length;
  const totalInventoryValue = medicines.reduce(
    (sum, m) => sum + (m.unitPrice ?? 0) * (m.stockRemaining ?? 0),
    0
  );
  const categoriesCount = new Set(medicines.map((m) => m.medicineCategory).filter(Boolean)).size;

  return (
    <div className="space-y-6 font-body text-clinic-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-clinic-primary-deep flex items-center gap-2">
            <span>คลังยาและเวชภัณฑ์</span>
          </h1>
          <p className="text-sm text-clinic-ink-soft mt-1">
            จัดการรายการยา ราคาต่อหน่วย ตรวจสอบสต็อกคงเหลือ และอัปเดตเวชภัณฑ์คลินิก
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-clinic-primary hover:bg-clinic-primary-deep transition-all shadow-md active:scale-95 cursor-pointer"
        >
          + เพิ่มรายการยาใหม่
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline ml-2 cursor-pointer">
            ปิด
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-control bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline ml-2 cursor-pointer">
            ปิด
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            รายการยาทั้งหมด
          </span>
          <div className="text-3xl font-bold text-clinic-primary-deep mt-1">{totalCount} รายการ</div>
        </div>

        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            ยาใกล้หมด / หมดคลัง
          </span>
          <div className="text-3xl font-bold text-amber-600 mt-1">{lowStockCount} รายการ</div>
        </div>

        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            มูลค่าคลังยารวม
          </span>
          <div className="text-3xl font-bold text-emerald-700 mt-1 font-mono">
            ฿{totalInventoryValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-card border border-clinic-line shadow-xs">
          <span className="text-xs font-semibold text-clinic-ink-soft uppercase tracking-wider">
            หมวดยาที่มีในคลัง
          </span>
          <div className="text-3xl font-bold text-clinic-accent-deep mt-1">{categoriesCount} หมวด</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-card border border-clinic-line shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-clinic-ink-soft">
              🔍
            </span>
            <input
              type="text"
              placeholder="ค้นหาชื่อยา, หมวดหมู่ หรือวิธีใช้..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-clinic-line rounded-control text-sm text-clinic-ink focus:outline-hidden focus:ring-2 focus:ring-clinic-primary bg-clinic-bg/40"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-clinic-ink-soft whitespace-nowrap">
              หมวดหมู่:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-clinic-line rounded-control text-xs text-clinic-ink bg-clinic-bg/40 focus:ring-2 focus:ring-clinic-primary cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Low Stock Toggle */}
            <button
              onClick={() => setShowLowStockOnly((prev) => !prev)}
              className={`px-3 py-2 rounded-control text-xs font-semibold border transition-all cursor-pointer ${
                showLowStockOnly
                  ? "bg-amber-100 text-amber-900 border-amber-300 shadow-xs"
                  : "bg-clinic-bg text-clinic-ink-soft border-clinic-line hover:border-clinic-primary"
              }`}
            >
              ⚠️ แสดงเฉพาะยาใกล้หมด ({lowStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      {loading ? (
        <div className="p-12 text-center text-clinic-ink-soft">กำลังโหลดข้อมูลคลังยา...</div>
      ) : filteredMedicines.length === 0 ? (
        <div className="border border-dashed border-clinic-line rounded-card p-12 text-center text-clinic-ink-soft bg-white/50 space-y-3">
          <p className="text-base font-medium">ไม่พบรายการยาตามเงื่อนไขที่ค้นหา</p>
          <button
            onClick={openCreateModal}
            className="text-sm font-semibold text-clinic-primary hover:underline cursor-pointer"
          >
            + เพิ่มรายการยาใหม่
          </button>
        </div>
      ) : (
        <div className="bg-white border border-clinic-line rounded-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-clinic-bg border-b border-clinic-line">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    ชื่อยา / เวชภัณฑ์
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    หมวดหมู่ / หน่วย
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    ราคา / หน่วย (฿)
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    คงเหลือในคลัง
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
                    คำแนะนำ / สรรพคุณ
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft text-right">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-line">
                {filteredMedicines.map((med) => {
                  const stock = med.stockRemaining ?? 0;
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= 10;

                  return (
                    <tr key={med.medicineId} className="hover:bg-clinic-bg/40 transition-colors">
                      {/* Name & ID */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-clinic-primary-deep">{med.medicineName}</div>
                        <div className="text-[11px] font-mono text-clinic-ink-soft mt-0.5">
                          ID: #{med.medicineId}
                        </div>
                      </td>

                      {/* Category & Unit */}
                      <td className="px-5 py-4">
                        <div className="text-clinic-ink font-medium">
                          {med.medicineCategory || "ทั่วไป"}
                        </div>
                        <div className="text-xs text-clinic-ink-soft">
                          หน่วย: <span className="font-semibold">{med.unitType || "หน่วย"}</span>
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="px-5 py-4 font-mono font-bold text-clinic-ink">
                        ฿{(med.unitPrice ?? 0).toFixed(2)}
                      </td>

                      {/* Stock Remaining */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-clinic-ink">
                            {stock} {med.unitType || ""}
                          </span>
                          {isOutOfStock && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              หมดคลัง
                            </span>
                          )}
                          {isLowStock && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              ใกล้หมด
                            </span>
                          )}
                          {!isOutOfStock && !isLowStock && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              มีในคลัง
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-clinic-ink-soft mt-0.5">
                          รับเข้า: {med.stockReceived ?? 0} | จ่ายออก: {med.stockIssued ?? 0}
                        </div>
                      </td>

                      {/* Note */}
                      <td className="px-5 py-4 text-xs text-clinic-ink-soft max-w-xs truncate">
                        {med.note || "-"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openEditModal(med)}
                          className="px-3 py-1.5 rounded-control text-xs font-semibold text-clinic-primary bg-clinic-bg hover:bg-clinic-primary hover:text-white transition-colors border border-clinic-line cursor-pointer"
                        >
                          ✏️ แก้ไขข้อมูล
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Medicine */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-card shadow-xl border border-clinic-line p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-clinic-line pb-3">
              <h3 className="font-display text-lg font-bold text-clinic-primary-deep">
                {editingMedicine ? `แก้ไขข้อมูลยา #${editingMedicine.medicineId}` : "เพิ่มรายการยาใหม่"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-clinic-ink-soft hover:text-clinic-ink text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-clinic-ink-soft mb-1">
                  ชื่อยา / เวชภัณฑ์ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ยาแก้ไอสมุนไพร, Paracetamol 500mg"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full px-3 py-2 border border-clinic-line rounded-control focus:outline-hidden focus:ring-2 focus:ring-clinic-primary bg-clinic-bg/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-clinic-ink-soft mb-1">
                    หมวดยา
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ยาสมุนไพร, ยาเม็ด"
                    value={medicineCategory}
                    onChange={(e) => setMedicineCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-clinic-line rounded-control focus:outline-hidden focus:ring-2 focus:ring-clinic-primary bg-clinic-bg/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-clinic-ink-soft mb-1">
                    หน่วยนับ (Unit Type)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น เม็ด, ขวด, แผง, ซอง"
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                    className="w-full px-3 py-2 border border-clinic-line rounded-control focus:outline-hidden focus:ring-2 focus:ring-clinic-primary bg-clinic-bg/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-clinic-ink-soft mb-1">
                    ราคาต่อหน่วย (฿) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-clinic-line rounded-control font-mono focus:outline-hidden focus:ring-2 focus:ring-clinic-primary bg-clinic-bg/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-clinic-ink-soft mb-1">
                    จำนวนคงเหลือในคลัง
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockRemaining}
                    onChange={(e) => setStockRemaining(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-clinic-line rounded-control font-mono focus:outline-hidden focus:ring-2 focus:ring-clinic-primary bg-clinic-bg/40"
                  />
                </div>
              </div>

              <div className="bg-clinic-bg/50 border border-clinic-line rounded-card p-3 space-y-3">
                <span className="text-xs font-bold text-clinic-primary-deep block">
                  📊 รายละเอียดการหมุนเวียนสต็อก
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-clinic-ink-soft mb-1">ยกมา</label>
                    <input
                      type="number"
                      min="0"
                      value={stockBroughtForward}
                      onChange={(e) => setStockBroughtForward(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-clinic-line rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-clinic-ink-soft mb-1">รับเข้า</label>
                    <input
                      type="number"
                      min="0"
                      value={stockReceived}
                      onChange={(e) => setStockReceived(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-clinic-line rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-clinic-ink-soft mb-1">จ่ายออก</label>
                    <input
                      type="number"
                      min="0"
                      value={stockIssued}
                      onChange={(e) => setStockIssued(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-clinic-line rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-clinic-ink-soft mb-1">
                  วิธีใช้ / หมายเหตุ
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น รับประทานครั้งละ 1 เม็ด หลังอาหาร เช้า-เย็น"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-clinic-line rounded-control focus:outline-hidden focus:ring-2 focus:ring-clinic-primary bg-clinic-bg/40 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-clinic-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-clinic-ink-soft hover:bg-clinic-line/30 rounded-control cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-clinic-primary hover:bg-clinic-primary-deep rounded-control shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูลยา"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
