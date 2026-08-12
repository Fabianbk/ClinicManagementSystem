import { NextResponse } from "next/server";
import { apiPost, ApiError } from "@/lib/api-client";
import { setSessionCookie } from "@/lib/auth-cookies";
import type { AuthResponseDTO, LoginRequestDTO } from "@/lib/types";

export async function POST(request: Request) {
  const dto = (await request.json()) as LoginRequestDTO;

  try {
    const auth = await apiPost<AuthResponseDTO>("/api/auth/login/doctor", dto, {
      anonymous: true,
    });
    await setSessionCookie(auth.token);

    // Token itself never goes to the client — just the display info.
    return NextResponse.json({
      role: auth.role,
      id: auth.id,
      username: auth.username,
      fullname: auth.fullname,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}