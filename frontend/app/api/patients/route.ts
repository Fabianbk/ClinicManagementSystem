import { NextResponse } from "next/server";
import { createPatient } from "@/lib/resources/patients";
import { ApiError } from "@/lib/api-client";
import type { PatientRequestDTO } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as PatientRequestDTO;
    const result = await createPatient(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to create patient" }, { status: 500 });
  }
}
