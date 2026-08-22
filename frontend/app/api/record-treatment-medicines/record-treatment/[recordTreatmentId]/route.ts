import { NextResponse } from "next/server";
import { getMedicinesByRecordTreatmentId } from "@/lib/resources/record-treatment-medicines";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { recordTreatmentId: string } }
) {
  try {
    const id = Number(params.recordTreatmentId);
    const data = await getMedicinesByRecordTreatmentId(id);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch medicines for treatment" }, { status: 500 });
  }
}
