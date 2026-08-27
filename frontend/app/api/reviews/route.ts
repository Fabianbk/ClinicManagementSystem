import { NextResponse } from "next/server";
import { createReview, getAllReviews } from "@/lib/resources/reviews";
import { ApiError } from "@/lib/api-client";
import type { ReviewRequestDTO } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as ReviewRequestDTO;
    const result = await createReview(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message, errors: err.errors },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { message: "ไม่สามารถบันทึกข้อมูลรีวิวได้" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 20);

    const result = await getAllReviews(page, size);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message, errors: err.errors },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { message: "ไม่สามารถโหลดข้อมูลรีวิวได้" },
      { status: 500 }
    );
  }
}
