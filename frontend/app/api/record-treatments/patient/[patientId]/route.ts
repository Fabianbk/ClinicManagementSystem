import { NextResponse } from "next/server";
import { getRecordTreatmentsByPatientId } from "@/lib/resources/record-treatments";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 50);
    const patientId = Number(params.patientId);

    const data = await getRecordTreatmentsByPatientId(patientId, page, size);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch patient treatment records" }, { status: 500 });
  }
}
