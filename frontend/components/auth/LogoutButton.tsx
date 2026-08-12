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
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="px-3.5 py-1.5 border border-clinic-line bg-white hover:bg-clinic-danger-bg hover:border-clinic-danger hover:text-clinic-danger text-clinic-ink rounded-control text-xs font-semibold transition-all disabled:opacity-60 cursor-pointer shadow-xs"
    >
      {isPending ? "กำลังออกจากระบบ…" : "ออกจากระบบ"}
    </button>
  );
}