"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
        setError(body?.message ?? "Username or password is incorrect.");
        return;
      }

      startTransition(() => {
        router.push(nextPath || defaultRedirect);
        router.refresh();
      });
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    }
  }

  const isDoctor = role === "DOCTOR";

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="p-3 rounded-control bg-clinic-danger-bg border border-clinic-danger text-clinic-danger text-sm font-medium" role="alert">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
        <span>Username</span>
        <input
          name="username"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isPending}
          className="w-full text-clinic-ink px-3.5 py-2.5 border border-clinic-line rounded-control bg-clinic-bg focus:outline-none focus:border-clinic-primary focus:ring-2 focus:ring-clinic-primary/20 transition-all font-normal normal-case text-base sm:text-sm"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-clinic-ink-soft">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          className="w-full text-clinic-ink px-3.5 py-2.5 border border-clinic-line rounded-control bg-clinic-bg focus:outline-none focus:border-clinic-primary focus:ring-2 focus:ring-clinic-primary/20 transition-all font-normal normal-case text-base sm:text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full mt-2 py-3 px-4 rounded-control font-semibold text-sm text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 cursor-pointer ${
          isDoctor
            ? "bg-clinic-primary hover:bg-clinic-primary-deep focus:ring-clinic-primary-deep"
            : "bg-clinic-accent-deep hover:bg-[#6E4C15] focus:ring-clinic-accent-deep"
        }`}
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}