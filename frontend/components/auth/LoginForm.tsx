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

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="login-form__error" role="alert">
          {error}
        </p>
      )}

      <label className="login-form__field">
        <span>Username</span>
        <input
          name="username"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isPending}
        />
      </label>

      <label className="login-form__field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
      </label>

      <button
        type="submit"
        className={`login-form__submit login-form__submit--${role.toLowerCase()}`}
        disabled={isPending}
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}