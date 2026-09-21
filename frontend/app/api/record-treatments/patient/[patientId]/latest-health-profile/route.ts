import { NextResponse } from "next/server";
import { getLatestHealthProfileByPatientId } from "@/lib/resources/record-treatments";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = Number(params.patientId);
    if (!patientId || isNaN(patientId)) {
      return NextResponse.json({ message: "Invalid patient ID" }, { status: 400 });
    }
    const data = await getLatestHealthProfileByPatientId(patientId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch latest health profile" }, { status: 500 });
  }
}
