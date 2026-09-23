import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookies";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type;
    const store = await cookies();
    const token = store.get(SESSION_COOKIE_NAME)?.value;

    const base = process.env.API_BASE_URL || "http://localhost:8080/api";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const prefix = cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;

    let backendPath = "";
    let defaultFilename = `blank-${type}.docx`;

    if (type === "intake-th") {
      backendPath = "/documents/blank/intake-th";
      defaultFilename = "blank-patient-intake-th.docx";
    } else if (type === "intake-en") {
      backendPath = "/documents/blank/intake-en";
      defaultFilename = "blank-patient-intake-en.docx";
    } else {
      return new NextResponse("Invalid blank document type", { status: 400 });
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${prefix}${backendPath}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new NextResponse(errorText || "Failed to generate blank form", {
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
