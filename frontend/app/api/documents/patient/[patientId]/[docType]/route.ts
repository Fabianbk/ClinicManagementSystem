import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookies";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { patientId: string; docType: string } }
) {
  try {
    const { patientId, docType } = params;
    const store = await cookies();
    const token = store.get(SESSION_COOKIE_NAME)?.value;

    const base = process.env.API_BASE_URL || "http://localhost:8080/api";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const prefix = cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;

    let backendPath = "";
    let defaultFilename = `patient-document-${patientId}.docx`;

    switch (docType) {
      case "intake-th":
        backendPath = `/documents/patient/${patientId}/intake-th`;
        defaultFilename = `patient-intake-th-${patientId}.docx`;
        break;
      case "intake-en":
        backendPath = `/documents/patient/${patientId}/intake-en`;
        defaultFilename = `patient-intake-en-${patientId}.docx`;
        break;
      case "opd-card":
        backendPath = `/documents/patient/${patientId}/opd-card`;
        defaultFilename = `opd-card-${patientId}.docx`;
        break;
      case "intake-form":
        backendPath = `/documents/intake-form/patient/${patientId}`;
        defaultFilename = `client-intake-patient-${patientId}.docx`;
        break;
      default:
        return new NextResponse("Invalid document type", { status: 400 });
    }

    const backendUrl = `${prefix}${backendPath}`;

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
      return new NextResponse(errorText || "Failed to generate document", {
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
          `attachment; filename="${defaultFilename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new NextResponse(message, { status: 500 });
  }
}
