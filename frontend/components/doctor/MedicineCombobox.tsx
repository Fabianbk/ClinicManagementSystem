"use client";

import * as React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  Search,
  ChevronsUpDown,
  Check,
  Pill,
  AlertTriangle,
  Clock,
  ShieldAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MedicineResponseDTO } from "@/lib/types";

export interface MedicineComboboxProps {
  medicines: MedicineResponseDTO[];
  selectedMedicineId?: number | null;
  onSelectMedicine: (medicine: MedicineResponseDTO) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function MedicineCombobox({
  medicines,
  selectedMedicineId,
  onSelectMedicine,
  onClear,
  placeholder = "พิมพ์ค้นหาชื่อยา, รหัส, หมวดหมู่, หรือสรรพคุณ...",
  disabled = false,
  className = "",
  error = false,
}: MedicineComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ทั้งหมด");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Currently selected medicine
  const selectedMedicine = useMemo(() => {
    if (!selectedMedicineId) return null;
    return medicines.find((m) => m.medicineId === selectedMedicineId) ?? null;
  }, [medicines, selectedMedicineId]);

  // Unique categories for filtering chips
  const categories = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach((m) => {
      if (m.medicineCategory && m.medicineCategory.trim()) {
        set.add(m.medicineCategory.trim());
      }
    });
    return ["ทั้งหมด", ...Array.from(set)];
  }, [medicines]);

  // Filter medicines: live search + category + active status
  const filteredMedicines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return medicines.filter((m) => {
      // Category filter
      if (selectedCategory !== "ทั้งหมด" && m.medicineCategory !== selectedCategory) {
        return false;
      }
      // Text search filter
      if (q) {
        const idStr = `#${m.medicineId}`;
        const nameMatch = m.medicineName.toLowerCase().includes(q);
        const catMatch = m.medicineCategory?.toLowerCase().includes(q);
        const noteMatch = m.note?.toLowerCase().includes(q);
        const idMatch = idStr.includes(q) || String(m.medicineId) === q;
        if (!nameMatch && !catMatch && !noteMatch && !idMatch) {
          return false;
        }
      }
      return true;
    });
  }, [medicines, searchQuery, selectedCategory]);

  // Reset highlight index when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, selectedCategory]);

  // Auto-focus search input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
      setSelectedCategory("ทั้งหมด");
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>("[data-combobox-item]");
    const activeItem = items[highlightedIndex];
    if (activeItem) {
      activeItem.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, open]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredMedicines.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredMedicines[highlightedIndex];
      if (target) {
        const isOutOfStock = (target.stockRemaining ?? 0) <= 0;
        const isInactive = target.isActive === false;
        if (!isOutOfStock && !isInactive) {
          onSelectMedicine(target);
          setOpen(false);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleItemSelect = (med: MedicineResponseDTO) => {
    if ((med.stockRemaining ?? 0) <= 0 || med.isActive === false) return;
    onSelectMedicine(med);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          onKeyDown={handleKeyDown}
          className={`w-full min-h-[38px] px-3 py-1.5 flex items-center justify-between gap-2 text-left rounded-control border bg-white transition-all text-xs ${
            error
              ? "border-clinic-danger ring-1 ring-clinic-danger"
              : "border-clinic-line hover:border-clinic-primary/60 focus:ring-2 focus:ring-clinic-primary/20 focus:border-clinic-primary"
          } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : "cursor-pointer"} ${className}`}
          aria-expanded={open}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Pill className="w-3.5 h-3.5 text-clinic-primary shrink-0" />
            {selectedMedicine ? (
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="font-bold text-clinic-ink truncate">
                  {selectedMedicine.medicineName}
                </span>
                {selectedMedicine.medicineCategory && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal bg-slate-50">
                    {selectedMedicine.medicineCategory}
                  </Badge>
                )}
                <span className="font-mono text-clinic-primary font-semibold text-[11px]">
                  ฿{selectedMedicine.unitPrice} / {selectedMedicine.unitType ?? "หน่วย"}
                </span>
                <span
                  className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    (selectedMedicine.stockRemaining ?? 0) <= 0
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : (selectedMedicine.stockRemaining ?? 0) <= 20
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {(selectedMedicine.stockRemaining ?? 0) <= 0
                    ? "หมดสต็อก"
                    : `คงเหลือ ${selectedMedicine.stockRemaining}`}
                </span>
              </div>
            ) : (
              <span className="text-clinic-ink-muted text-xs truncate">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 text-clinic-ink-soft">
            {selectedMedicine && onClear && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="p-1 hover:text-clinic-danger rounded-full hover:bg-slate-100"
                title="ล้างการเลือก"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <ChevronsUpDown className="w-3.5 h-3.5 opacity-60" />
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={5}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[360px] max-w-[540px] rounded-card border border-clinic-line bg-white shadow-lg animate-in fade-in-0 zoom-in-95 p-0 overflow-hidden font-body"
        >
          {/* Search Header */}
          <div className="p-2.5 border-b border-clinic-line bg-clinic-bg/40 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-clinic-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ค้นหาชื่อตำรับยา, รหัส, สรรพคุณ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-clinic-line rounded-control focus:outline-none focus:ring-1 focus:ring-clinic-primary focus:border-clinic-primary text-clinic-ink placeholder:text-clinic-ink-muted"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-clinic-ink-muted hover:text-clinic-ink p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Category Filter Chips */}
            {categories.length > 2 && (
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-[10px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? "bg-clinic-primary text-white font-bold"
                        : "bg-white border border-clinic-line text-clinic-ink hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="max-h-[300px] overflow-y-auto divide-y divide-clinic-line/60 p-1"
          >
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((med, idx) => {
                const isSelected = med.medicineId === selectedMedicineId;
                const isHighlighted = idx === highlightedIndex;
                const remaining = med.stockRemaining ?? 0;
                const isOutOfStock = remaining <= 0;
                const isInactive = med.isActive === false;
                const isDisabled = isOutOfStock || isInactive;

                return (
                  <div
                    key={med.medicineId}
                    data-combobox-item
                    onClick={() => handleItemSelect(med)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`p-2.5 rounded-control transition-all flex items-start justify-between gap-3 text-xs ${
                      isDisabled
                        ? "opacity-55 cursor-not-allowed bg-slate-50/50"
                        : "cursor-pointer"
                    } ${
                      isHighlighted && !isDisabled
                        ? "bg-clinic-primary/10 text-clinic-primary-deep"
                        : ""
                    } ${isSelected ? "ring-1 ring-clinic-primary/40 bg-clinic-primary-soft/20" : ""}`}
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <div className="pt-0.5 shrink-0">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-clinic-primary font-bold" />
                        ) : (
                          <Pill className="w-3.5 h-3.5 text-clinic-ink-muted" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-clinic-ink">
                            {med.medicineName}
                          </span>
                          <span className="font-mono text-[10px] text-clinic-ink-muted">
                            #{med.medicineId}
                          </span>
                          {med.medicineCategory && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                              {med.medicineCategory}
                            </span>
                          )}
                          {isInactive && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                              เลิกจำหน่าย
                            </span>
                          )}
                        </div>

                        {med.note && (
                          <p className="text-[11px] text-clinic-ink-soft line-clamp-1 italic">
                            {med.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stock & Price info */}
                    <div className="text-right shrink-0 space-y-1">
                      <div className="font-mono font-bold text-clinic-ink text-xs">
                        ฿{med.unitPrice}{" "}
                        <span className="text-[10px] font-normal text-clinic-ink-muted">
                          / {med.unitType ?? "หน่วย"}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                            isOutOfStock
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : remaining <= 20
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isOutOfStock ? "หมดสต็อก" : `เหลือ ${remaining} ${med.unitType ?? ""}`}
                        </span>

                        {med.hasExpired && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-700">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            มีล็อตหมดอายุ
                          </span>
                        )}
                        {med.hasExpiringSoon && !med.hasExpired && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-orange-700">
                            <Clock className="w-2.5 h-2.5" />
                            ใกล้หมด: {med.earliestExpiryDate ?? ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-clinic-ink-muted text-xs space-y-1">
                <AlertTriangle className="w-5 h-5 mx-auto text-clinic-ink-muted opacity-50" />
                <p>ไม่พบรายการยาที่ตรงกับคำค้นหา "{searchQuery}"</p>
                <p className="text-[11px]">ลองค้นหาด้วยชื่อยา หมวดหมู่ หรือสรรพคุณ</p>
              </div>
            )}
          </div>

          {/* Footer with summary */}
          <div className="p-2 border-t border-clinic-line bg-clinic-bg/40 flex items-center justify-between text-[11px] text-clinic-ink-soft">
            <span>แสดง {filteredMedicines.length} จาก {medicines.length} ตำรับยา</span>
            <span className="text-[10px] text-clinic-ink-muted">ใช้ ↑ ↓ และ Enter เพื่อเลือก</span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
