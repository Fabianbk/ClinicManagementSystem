import { NextResponse } from "next/server";
import { getDoctors } from "@/lib/resources/doctors";
import { ApiError } from "@/lib/api-client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 100);

    const data = await getDoctors(page, size);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch doctors" }, { status: 500 });
  }
}
