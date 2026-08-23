import { NextResponse } from "next/server";
import { updateSlotStatus } from "@/lib/resources/appointment-slots";
import { ApiError } from "@/lib/api-client";
import type { AppointmentSlotStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const slotId = Number(params.id);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as AppointmentSlotStatus;

    if (!status) {
      return NextResponse.json({ message: "Status param is required" }, { status: 400 });
    }

    const result = await updateSlotStatus(slotId, status);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to update slot status" }, { status: 500 });
  }
}
