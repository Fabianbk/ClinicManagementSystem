import { apiGet, apiPost } from "@/lib/api-client";
import type { ReceiptRequestDTO, ReceiptResponseDTO } from "@/lib/types";

export const issueReceipt = (dto: ReceiptRequestDTO) =>
  apiPost<ReceiptResponseDTO>("/api/receipts", dto);

export const getReceipt = (id: number) =>
  apiGet<ReceiptResponseDTO>(`/api/receipts/${id}`);

export const getReceiptByRecordTreatmentId = (recordTreatmentId: number) =>
  apiGet<ReceiptResponseDTO>(`/api/receipts/record-treatment/${recordTreatmentId}`);

// NOTE: the print endpoint (GET /api/receipts/record-treatment/{id}/print)
// returns a raw PDF, not an ApiResponse envelope, and is protected by
// @PreAuthorize — a browser can't attach the Authorization bearer header
// by navigating there directly, since the JWT only lives in our httpOnly
// cookie on the Next.js origin. This needs a Next.js proxy route handler
// (like the auth login routes) that fetches the PDF server-side with the
// token and streams it back. Deferred to Step 10 (Print flows) — flagging
// now so it's not a surprise later.