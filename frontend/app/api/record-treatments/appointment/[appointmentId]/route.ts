import { NextResponse } from "next/server";
import { getRecordTreatmentByAppointmentId } from "@/lib/resources/record-treatments";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const appointmentId = Number(params.appointmentId);
    const data = await getRecordTreatmentByAppointmentId(appointmentId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch treatment record for appointment" }, { status: 500 });
  }
}
