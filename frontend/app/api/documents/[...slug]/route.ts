import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookies";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug || [];
    const subPath = slug.join("/");
    const { searchParams } = new URL(request.url);

    const store = await cookies();
    const token = store.get(SESSION_COOKIE_NAME)?.value;

    const base = process.env.API_BASE_URL || "http://localhost:8080/api";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const prefix = cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;

    const url = new URL(`${prefix}/documents/${subPath}`);
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

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
      return new NextResponse(errorText || `Failed to download document: ${subPath}`, {
        status: res.status,
      });
    }

    const blob = await res.arrayBuffer();
    const fallbackFilename = `${slug[slug.length - 1] || "document"}.docx`;

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type":
          res.headers.get("Content-Type") ||
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          res.headers.get("Content-Disposition") ||
          `attachment; filename="${fallbackFilename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new NextResponse(message, { status: 500 });
  }
}
