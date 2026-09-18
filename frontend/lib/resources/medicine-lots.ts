import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type {
  MedicineLotRequestDTO,
  MedicineLotResponseDTO,
  StockAdjustmentRequestDTO,
  MedicineResponseDTO,
} from "@/lib/types";

/** Receives stock into a new lot */
export const receiveStockLot = (dto: MedicineLotRequestDTO) =>
  apiPost<MedicineLotResponseDTO>("/api/medicine-lots", dto);

/** Adjusts physical stock / write-offs */
export const adjustStock = (dto: StockAdjustmentRequestDTO) =>
  apiPost<MedicineResponseDTO>("/api/medicine-lots/adjust", dto);

/** Gets all lots of a medicine */
export const getMedicineLots = (medicineId: number) =>
  apiGet<MedicineLotResponseDTO[]>(`/api/medicine-lots/medicine/${medicineId}`);

/** Gets lots that are expiring soon or already expired */
export const getExpiringLots = (days = 60) =>
  apiGet<MedicineLotResponseDTO[]>("/api/medicine-lots/expiring", { params: { days } });

/** Deletes an unused lot */
export const deleteMedicineLot = (lotId: number) =>
  apiDelete(`/api/medicine-lots/${lotId}`);
