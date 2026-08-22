import { apiGet } from "@/lib/api-client";
import type { PageResponse, DoctorResponseDTO } from "@/lib/types";

export const getDoctors = (page = 0, size = 100) =>
  apiGet<PageResponse<DoctorResponseDTO>>("/api/doctors", { params: { page, size } });

export const getDoctor = (id: number) =>
  apiGet<DoctorResponseDTO>(`/api/doctors/${id}`);
