import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookies";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { recordTreatmentId: string } }
) {
  try {
    const recordTreatmentId = params.recordTreatmentId;
    const store = await cookies();
    const token = store.get(SESSION_COOKIE_NAME)?.value;

    const base = process.env.API_BASE_URL || "http://localhost:8080/api";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const backendUrl = cleanBase.endsWith("/api")
      ? `${cleanBase}/receipts/record-treatment/${recordTreatmentId}/print`
      : `${cleanBase}/api/receipts/record-treatment/${recordTreatmentId}/print`;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new NextResponse(errorText || "Failed to generate receipt PDF", {
        status: res.status,
      });
    }

    const pdfBuffer = await res.arrayBuffer();
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          res.headers.get("Content-Disposition") ||
          `inline; filename="receipt-${recordTreatmentId}.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new NextResponse(message, { status: 500 });
  }
}
