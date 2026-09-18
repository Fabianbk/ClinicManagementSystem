import { NextResponse } from "next/server";
import { getMedicineLots } from "@/lib/resources/medicine-lots";
import { ApiError } from "@/lib/api-client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const data = await getMedicineLots(id);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch lots for medicine" }, { status: 500 });
  }
}
