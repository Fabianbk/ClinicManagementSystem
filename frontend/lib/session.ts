import "server-only";
import { cookies } from "next/headers";
import { decodeJwtPayload, isJwtExpired } from "./jwt";
import { SESSION_COOKIE_NAME } from "./auth-cookies";

export interface Session {
  role: "DOCTOR" | "PATIENT";
  id: number;
  username: string;
}

/** Reads the current session for use in Server Components/layouts (e.g. "Hi, {username}"). */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload || isJwtExpired(payload)) return null;

  return { role: payload.role, id: payload.id, username: payload.sub };
}