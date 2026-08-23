import { NextResponse } from "next/server";
import { getPatient, updatePatient } from "@/lib/resources/patients";
import { ApiError } from "@/lib/api-client";
import type { PatientRequestDTO } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = Number(params.id);
    if (isNaN(patientId)) {
      return NextResponse.json({ message: "Invalid patient ID" }, { status: 400 });
    }

    const patient = await getPatient(patientId);
    return NextResponse.json(patient);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message, errors: err.errors },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { message: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = Number(params.id);
    if (isNaN(patientId)) {
      return NextResponse.json({ message: "Invalid patient ID" }, { status: 400 });
    }

    const dto = (await request.json()) as PatientRequestDTO;
    const result = await updatePatient(patientId, dto);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message, errors: err.errors },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { message: "Failed to update patient" },
      { status: 500 }
    );
  }
}
