import { NextResponse } from "next/server";
import { getReceiptByRecordTreatmentId } from "@/lib/resources/receipts";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { recordTreatmentId: string } }
) {
  try {
    const recordTreatmentId = Number(params.recordTreatmentId);
    const data = await getReceiptByRecordTreatmentId(recordTreatmentId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch receipt" }, { status: 500 });
  }
}
