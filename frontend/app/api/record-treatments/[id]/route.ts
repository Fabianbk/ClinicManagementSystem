import { NextResponse } from "next/server";
import { getRecordTreatment, updateRecordTreatment } from "@/lib/resources/record-treatments";
import { ApiError } from "@/lib/api-client";
import type { RecordTreatmentRequestDTO } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const data = await getRecordTreatment(id);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch treatment record" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const dto = (await request.json()) as RecordTreatmentRequestDTO;
    const result = await updateRecordTreatment(id, dto);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to update treatment record" }, { status: 500 });
  }
}
