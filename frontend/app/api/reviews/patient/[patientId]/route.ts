import { NextResponse } from "next/server";
import { getReviewByPatientId } from "@/lib/resources/reviews";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = Number(params.patientId);
    const result = await getReviewByPatientId(patientId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message, errors: err.errors },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { message: "ไม่สามารถโหลดข้อมูลรีวิวของผู้ป่วยได้" },
      { status: 500 }
    );
  }
}
