import { NextResponse } from "next/server";
import { getMedicine, updateMedicine } from "@/lib/resources/medicines";
import { ApiError } from "@/lib/api-client";
import type { MedicineRequestDTO } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const data = await getMedicine(id);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch medicine" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const dto = (await request.json()) as MedicineRequestDTO;
    const result = await updateMedicine(id, dto);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to update medicine" }, { status: 500 });
  }
}
