import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "clinic_session";

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // No maxAge/expires set on purpose — this makes it a browser-session
    // cookie that clears on browser close, per your preference. The JWT
    // itself still expires server-side after app.jwt.expiration-ms (24h)
    // regardless of whether the cookie is still sitting in the browser.
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}