import { NextResponse } from "next/server";
import { createWorkingSchedule } from "@/lib/resources/working-schedules";
import { ApiError } from "@/lib/api-client";
import type { WorkingScheduleRequestDTO } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as WorkingScheduleRequestDTO;
    const result = await createWorkingSchedule(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to create working schedule" }, { status: 500 });
  }
}
