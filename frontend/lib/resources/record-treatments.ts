import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import type {
  PageResponse,
  RecordTreatmentRequestDTO,
  RecordTreatmentResponseDTO,
} from "@/lib/types";

export const createRecordTreatment = (dto: RecordTreatmentRequestDTO) =>
  apiPost<RecordTreatmentResponseDTO>("/api/record-treatments", dto);

export const getRecordTreatment = (id: number) =>
  apiGet<RecordTreatmentResponseDTO>(`/api/record-treatments/${id}`);

export const getAllRecordTreatments = (page = 0, size = 20) =>
  apiGet<PageResponse<RecordTreatmentResponseDTO>>("/api/record-treatments", {
    params: { page, size },
  });

export const getRecordTreatmentsByPatientId = (patientId: number, page = 0, size = 20) =>
  apiGet<PageResponse<RecordTreatmentResponseDTO>>(`/api/record-treatments/patient/${patientId}`, {
    params: { page, size },
  });

export const getRecordTreatmentByAppointmentId = (appointmentId: number) =>
  apiGet<RecordTreatmentResponseDTO>(`/api/record-treatments/appointment/${appointmentId}`);

export const updateRecordTreatment = (id: number, dto: RecordTreatmentRequestDTO) =>
  apiPut<RecordTreatmentResponseDTO>(`/api/record-treatments/${id}`, dto);