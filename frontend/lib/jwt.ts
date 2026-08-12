// Unsigned JWT payload decode — used only for UX routing decisions
// (middleware redirects, "who's logged in" display). Never trusted for
// authorization; Spring Security verifies the signature on every real call.

export interface JwtPayload {
  sub: string; // username
  role: "DOCTOR" | "PATIENT";
  id: number;
  iat: number;
  exp: number;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(payload: JwtPayload): boolean {
  return Date.now() >= payload.exp * 1000;
}