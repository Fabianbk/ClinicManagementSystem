import { NextResponse } from "next/server";
import { issueReceipt } from "@/lib/resources/receipts";
import { ApiError } from "@/lib/api-client";
import type { ReceiptRequestDTO } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const dto = (await request.json()) as ReceiptRequestDTO;
    const result = await issueReceipt(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message, errors: err.errors }, { status: err.status });
    }
    return NextResponse.json({ message: "Failed to issue receipt" }, { status: 500 });
  }
}
