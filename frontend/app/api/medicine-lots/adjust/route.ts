import { NextResponse } from "next/server";
import { adjustStock } from "@/lib/resources/medicine-lots";
import { ApiError } from "@/lib/api-client";
import type { StockAdjustmentRequestDTO } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as StockAdjustmentRequestDTO;
    const result = await adjustStock(dto);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to adjust stock" }, { status: 500 });
  }
}
