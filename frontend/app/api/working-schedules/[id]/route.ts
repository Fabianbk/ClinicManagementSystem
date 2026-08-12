import { NextResponse } from "next/server";
import { deleteWorkingSchedule } from "@/lib/resources/working-schedules";
import { ApiError } from "@/lib/api-client";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = Number(params.id);
    await deleteWorkingSchedule(scheduleId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to delete working schedule" }, { status: 500 });
  }
}
