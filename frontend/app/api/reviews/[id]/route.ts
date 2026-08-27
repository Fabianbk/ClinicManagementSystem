import { NextResponse } from "next/server";
import { getReview, updateReview } from "@/lib/resources/reviews";
import { ApiError } from "@/lib/api-client";
import type { ReviewRequestDTO } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const result = await getReview(id);
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const dto = (await request.json()) as ReviewRequestDTO;
    const result = await updateReview(id, dto);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message, errors: err.errors },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { message: "ไม่สามารถแก้ไขข้อมูลรีวิวได้" },
      { status: 500 }
    );
  }
}
