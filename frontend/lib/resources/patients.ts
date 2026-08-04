import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import type {
  PageResponse,
  PatientRequestDTO,
  PatientResponseDTO,
  ContactPersonRequestDTO,
  ContactPersonResponseDTO,
} from "@/lib/types";

export const getPatients = (page = 0, size = 20) =>
  apiGet<PageResponse<PatientResponseDTO>>("/api/patients", { params: { page, size } });

export const getPatient = (id: number) =>
  apiGet<PatientResponseDTO>(`/api/patients/${id}`);

export const createPatient = (dto: PatientRequestDTO) =>
  apiPost<PatientResponseDTO>("/api/patients", dto);

export const updatePatient = (id: number, dto: PatientRequestDTO) =>
  apiPut<PatientResponseDTO>(`/api/patients/${id}`, dto);

export const addContactPerson = (patientId: number, dto: ContactPersonRequestDTO) =>
  apiPost<ContactPersonResponseDTO>(`/api/patients/${patientId}/contact-persons`, dto);

export const removeContactPerson = (patientId: number, contactId: number) =>
  apiDelete(`/api/patients/${patientId}/contact-persons/${contactId}`);

export const deletePatient = (id: number) => apiDelete(`/api/patients/${id}`);