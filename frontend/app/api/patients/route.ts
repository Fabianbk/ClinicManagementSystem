import { NextResponse } from "next/server";
import { createPatient, getPatients } from "@/lib/resources/patients";
import { ApiError } from "@/lib/api-client";
import type { PatientRequestDTO } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 20);
    const query = searchParams.get("query") ?? undefined;

    const data = await getPatients(page, size, query);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch patients" }, { status: 500 });
  }
}


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
