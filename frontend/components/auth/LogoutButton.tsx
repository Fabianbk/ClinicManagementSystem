"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <button type="button" className="logout-btn" onClick={handleLogout} disabled={isPending}>
      {isPending ? "กำลังออกจากระบบ…" : "ออกจากระบบ"}
    </button>
  );
}