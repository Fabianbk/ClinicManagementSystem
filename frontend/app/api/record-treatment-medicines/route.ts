import { NextResponse } from "next/server";
import { addRecordTreatmentMedicine } from "@/lib/resources/record-treatment-medicines";
import { ApiError } from "@/lib/api-client";
import type { RecordTreatmentMedicineRequestDTO } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as RecordTreatmentMedicineRequestDTO;
    const result = await addRecordTreatmentMedicine(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to dispense medicine" }, { status: 500 });
  }
}
