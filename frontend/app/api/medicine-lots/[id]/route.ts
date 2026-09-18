import { NextResponse } from "next/server";
import { deleteMedicineLot } from "@/lib/resources/medicine-lots";
import { ApiError } from "@/lib/api-client";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await deleteMedicineLot(id);
    return NextResponse.json({ success: true, message: "Lot deleted successfully" });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to delete lot" }, { status: 500 });
  }
}
