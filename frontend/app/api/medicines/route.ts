import { NextResponse } from "next/server";
import { getAllMedicines, createMedicine } from "@/lib/resources/medicines";
import { ApiError } from "@/lib/api-client";
import type { MedicineRequestDTO } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 100);

    const data = await getAllMedicines(page, size);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch medicines" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as MedicineRequestDTO;
    const result = await createMedicine(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to create medicine" }, { status: 500 });
  }
}
