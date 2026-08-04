import { apiGet, apiPost } from "@/lib/api-client";
import type { PatientAccountRequestDTO, PatientAccountResponseDTO } from "@/lib/types";

export const createPatientAccount = (dto: PatientAccountRequestDTO) =>
  apiPost<PatientAccountResponseDTO>("/api/patient-accounts", dto);

export const getPatientAccountByPatientId = (patientId: number) =>
  apiGet<PatientAccountResponseDTO>(`/api/patient-accounts/patient/${patientId}`);