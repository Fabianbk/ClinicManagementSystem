import { NextResponse } from "next/server";
import { receiveStockLot, getExpiringLots } from "@/lib/resources/medicine-lots";
import { ApiError } from "@/lib/api-client";
import type { MedicineLotRequestDTO } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days") ?? 60);
    const data = await getExpiringLots(days);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to fetch expiring lots" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as MedicineLotRequestDTO;
    const result = await receiveStockLot(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to receive stock into lot" }, { status: 500 });
  }
}
