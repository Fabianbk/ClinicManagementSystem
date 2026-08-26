"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  role: "DOCTOR" | "PATIENT";
  loginPath: string;
  defaultRedirect: string;
  nextPath?: string;
}

export function LoginForm({ role, loginPath, defaultRedirect, nextPath }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(loginPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      startTransition(() => {
        router.push(nextPath || defaultRedirect);
        router.refresh();
      });
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ");
    }
  }

  const isDoctor = role === "DOCTOR";

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="p-3.5 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-xs font-medium" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="username" required>
          ชื่อผู้ใช้ (Username)
        </Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          required
          placeholder={isDoctor ? "doctor1" : "patient1"}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" required>
          รหัสผ่าน (Password)
        </Label>
        <Input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        variant={isDoctor ? "default" : "terracotta"}
        className="w-full mt-2"
        size="lg"
      >
        {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  );
}