import { NextResponse } from "next/server";
import { getAppointmentsByDoctorId } from "@/lib/resources/appointments";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { doctorId: string } }
) {
  try {
    const doctorId = Number(params.doctorId);
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 100);

    const data = await getAppointmentsByDoctorId(doctorId, page, size);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch doctor appointments" }, { status: 500 });
  }
}
