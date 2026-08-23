import { NextResponse } from "next/server";
import { noShowAppointment } from "@/lib/resources/appointments";
import { ApiError } from "@/lib/api-client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = Number(params.id);
    const data = await noShowAppointment(appointmentId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to mark appointment as no-show" }, { status: 500 });
  }
}
