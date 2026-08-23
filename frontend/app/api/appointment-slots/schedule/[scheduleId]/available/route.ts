import { NextResponse } from "next/server";
import { getAvailableSlotsByScheduleId } from "@/lib/resources/appointment-slots";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { scheduleId: string } }
) {
  try {
    const scheduleId = Number(params.scheduleId);
    const data = await getAvailableSlotsByScheduleId(scheduleId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch available appointment slots" }, { status: 500 });
  }
}
