import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwtPayload, isJwtExpired } from "@/lib/jwt";

// Duplicated here deliberately: middleware runs in the Edge runtime and
// this file must stay self-contained rather than importing
// lib/auth-cookies.ts, which pulls in next/headers' Node-style cookies().
const SESSION_COOKIE_NAME = "clinic_session";

function isDoctorRoute(pathname: string) {
  return pathname.startsWith("/doctor") && pathname !== "/doctor/login";
}

function isPatientRoute(pathname: string) {
  return pathname.startsWith("/patient") && pathname !== "/patient/login";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsDoctor = isDoctorRoute(pathname);
  const needsPatient = isPatientRoute(pathname);
  if (!needsDoctor && !needsPatient) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const authenticated = payload !== null && !isJwtExpired(payload);
  const roleMatches =
    authenticated &&
    ((needsDoctor && payload!.role === "DOCTOR") ||
      (needsPatient && payload!.role === "PATIENT"));

  if (!authenticated || !roleMatches) {
    const loginPath = needsDoctor ? "/doctor/login" : "/patient/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*"],
};