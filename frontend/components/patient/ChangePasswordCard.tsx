"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function ChangePasswordCard() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!oldPassword.trim()) {
      setErrorMessage("กรุณาระบุรหัสผ่านปัจจุบัน");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword === oldPassword) {
      setErrorMessage("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("การยืนยันรหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/patient/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: oldPassword.trim(),
          newPassword: newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }

      toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
      setSuccessMessage("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ท่านสามารถใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งถัดไป");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMessage(err.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
      toast.error(err.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-clinic-line">
      <CardHeader className="pb-3 border-b border-clinic-line">
        <CardTitle className="text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-clinic-primary" />
          <span>ความปลอดภัยและรหัสผ่าน (Security & Password)</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <p className="text-xs text-clinic-ink-soft leading-relaxed">
          ท่านสามารถเปลี่ยนรหัสผ่านเข้าสู่ระบบผู้ป่วยได้ด้วยตนเอง โดยระบุรหัสผ่านปัจจุบันและกำหนดรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
        </p>

        {errorMessage && (
          <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-control bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Old Password */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-clinic-ink">
              รหัสผ่านปัจจุบัน <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showOld ? "text" : "password"}
                placeholder="ระบุรหัสผ่านเดิม..."
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={submitting}
                className="text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-clinic-ink-soft hover:text-clinic-ink transition-colors p-1"
                tabIndex={-1}
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2. New Password */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-clinic-ink">
              รหัสผ่านใหม่ <span className="text-rose-500">*</span>
              <span className="text-[11px] font-normal text-clinic-ink-soft ml-1.5">
                (อย่างน้อย 6 ตัวอักษร)
              </span>
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="กำหนดรหัสผ่านใหม่..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submitting}
                className="text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-clinic-ink-soft hover:text-clinic-ink transition-colors p-1"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3. Confirm New Password */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-clinic-ink">
              ยืนยันรหัสผ่านใหม่ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className="text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-clinic-ink-soft hover:text-clinic-ink transition-colors p-1"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-500 pt-0.5">
                รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting || !oldPassword || !newPassword || !confirmPassword}
              size="sm"
              className="w-full sm:w-auto bg-clinic-primary hover:bg-clinic-primary-deep text-white font-bold text-xs gap-1.5 shadow-2xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>บันทึกรหัสผ่านใหม่</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
