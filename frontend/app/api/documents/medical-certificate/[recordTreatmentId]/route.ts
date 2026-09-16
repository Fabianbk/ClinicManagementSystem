import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookies";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { recordTreatmentId: string } }
) {
  try {
    const recordTreatmentId = params.recordTreatmentId;
    const { searchParams } = new URL(request.url);
    const sickLeaveDays = searchParams.get("sickLeaveDays");
    const sickLeaveFrom = searchParams.get("sickLeaveFrom");
    const sickLeaveTo = searchParams.get("sickLeaveTo");

    const store = await cookies();
    const token = store.get(SESSION_COOKIE_NAME)?.value;

    const base = process.env.API_BASE_URL || "http://localhost:8080/api";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const url = new URL(
      cleanBase.endsWith("/api")
        ? `${cleanBase}/documents/medical-certificate/${recordTreatmentId}`
        : `${cleanBase}/api/documents/medical-certificate/${recordTreatmentId}`
    );

    if (sickLeaveDays) url.searchParams.set("sickLeaveDays", sickLeaveDays);
    if (sickLeaveFrom) url.searchParams.set("sickLeaveFrom", sickLeaveFrom);
    if (sickLeaveTo) url.searchParams.set("sickLeaveTo", sickLeaveTo);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new NextResponse(errorText || "Failed to generate medical certificate", {
        status: res.status,
      });
    }

    const blob = await res.arrayBuffer();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          res.headers.get("Content-Disposition") ||
          `attachment; filename="medical-certificate-${recordTreatmentId}.docx"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new NextResponse(message, { status: 500 });
  }
}
