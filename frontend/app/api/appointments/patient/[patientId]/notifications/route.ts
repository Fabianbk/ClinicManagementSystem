import { NextResponse } from "next/server";
import { getUpcomingNotifications } from "@/lib/resources/appointments";
import { ApiError } from "@/lib/api-client";

export async function GET(
  _request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = Number(params.patientId);
    if (isNaN(patientId)) {
      return NextResponse.json({ message: "Invalid patientId" }, { status: 400 });
    }

    const data = await getUpcomingNotifications(patientId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch notifications" }, { status: 500 });
  }
}
