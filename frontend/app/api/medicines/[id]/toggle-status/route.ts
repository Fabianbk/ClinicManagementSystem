import { NextResponse } from "next/server";
import { toggleMedicineStatus } from "@/lib/resources/medicines";
import { ApiError } from "@/lib/api-client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const result = await toggleMedicineStatus(id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to toggle medicine status" }, { status: 500 });
  }
}
