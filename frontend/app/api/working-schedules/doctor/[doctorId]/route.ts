import { NextResponse } from "next/server";
import { getWorkingSchedulesByDoctor } from "@/lib/resources/working-schedules";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { doctorId: string } }
) {
  try {
    const doctorId = Number(params.doctorId);
    const data = await getWorkingSchedulesByDoctor(doctorId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch working schedules" }, { status: 500 });
  }
}
