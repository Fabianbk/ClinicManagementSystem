import { NextResponse } from "next/server";
import { removeRecordTreatmentMedicine } from "@/lib/resources/record-treatment-medicines";
import { ApiError } from "@/lib/api-client";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await removeRecordTreatmentMedicine(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to remove medicine" }, { status: 500 });
  }
}
