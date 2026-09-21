import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api-client";
import type { MedicineRequestDTO, MedicineResponseDTO, PageResponse } from "@/lib/types";

export const createMedicine = (dto: MedicineRequestDTO) =>
  apiPost<MedicineResponseDTO>("/api/medicines", dto);

export const getMedicine = (id: number) =>
  apiGet<MedicineResponseDTO>(`/api/medicines/${id}`);

export const getAllMedicines = (page = 0, size = 20, activeOnly?: boolean) =>
  apiGet<PageResponse<MedicineResponseDTO>>("/api/medicines", {
    params: { page, size, ...(activeOnly !== undefined ? { activeOnly } : {}) },
  });

export const updateMedicine = (id: number, dto: MedicineRequestDTO) =>
  apiPut<MedicineResponseDTO>(`/api/medicines/${id}`, dto);

export const toggleMedicineStatus = (id: number) =>
  apiPatch<MedicineResponseDTO>(`/api/medicines/${id}/toggle-status`, {});

export const deleteMedicine = (id: number) =>
  apiDelete(`/api/medicines/${id}`);