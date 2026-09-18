import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import type { MedicineRequestDTO, MedicineResponseDTO, PageResponse } from "@/lib/types";

export const createMedicine = (dto: MedicineRequestDTO) =>
  apiPost<MedicineResponseDTO>("/api/medicines", dto);

export const getMedicine = (id: number) =>
  apiGet<MedicineResponseDTO>(`/api/medicines/${id}`);

export const getAllMedicines = (page = 0, size = 20) =>
  apiGet<PageResponse<MedicineResponseDTO>>("/api/medicines", { params: { page, size } });

export const updateMedicine = (id: number, dto: MedicineRequestDTO) =>
  apiPut<MedicineResponseDTO>(`/api/medicines/${id}`, dto);

export const deleteMedicine = (id: number) =>
  apiDelete(`/api/medicines/${id}`);