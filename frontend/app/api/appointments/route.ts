import { NextResponse } from "next/server";
import { getAllAppointments, bookAppointment } from "@/lib/resources/appointments";
import { ApiError } from "@/lib/api-client";
import type { AppointmentRequestDTO } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 50);

    const data = await getAllAppointments(page, size);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as AppointmentRequestDTO;
    const data = await bookAppointment(dto);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to book appointment" }, { status: 500 });
  }
}

