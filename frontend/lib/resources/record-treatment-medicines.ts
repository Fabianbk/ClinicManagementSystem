import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import type {
  RecordTreatmentMedicineRequestDTO,
  RecordTreatmentMedicineResponseDTO,
} from "@/lib/types";

/** Dispenses a medicine against a RecordTreatment; price/subtotal are computed server-side. */
export const addRecordTreatmentMedicine = (dto: RecordTreatmentMedicineRequestDTO) =>
  apiPost<RecordTreatmentMedicineResponseDTO>("/api/record-treatment-medicines", dto);

export const getMedicinesByRecordTreatmentId = (recordTreatmentId: number) =>
  apiGet<RecordTreatmentMedicineResponseDTO[]>(
    `/api/record-treatment-medicines/record-treatment/${recordTreatmentId}`
  );

/** Removes a dispensed-medicine line and restores stock. Blocked once a receipt exists. */
export const removeRecordTreatmentMedicine = (id: number) =>
  apiDelete(`/api/record-treatment-medicines/${id}`);