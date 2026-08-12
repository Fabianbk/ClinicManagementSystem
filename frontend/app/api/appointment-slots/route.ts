import { NextResponse } from "next/server";
import { createAppointmentSlot } from "@/lib/resources/appointment-slots";
import { ApiError } from "@/lib/api-client";
import type { AppointmentSlotRequestDTO } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as AppointmentSlotRequestDTO;
    const result = await createAppointmentSlot(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to create appointment slot" }, { status: 500 });
  }
}
