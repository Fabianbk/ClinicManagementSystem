import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import type {
  AppointmentRequestDTO,
  AppointmentResponseDTO,
  NotifyAppointmentResponseDTO,
  PageResponse,
} from "@/lib/types";

export const bookAppointment = (dto: AppointmentRequestDTO) =>
  apiPost<AppointmentResponseDTO>("/api/appointments", dto);

export const getAppointment = (id: number) =>
  apiGet<AppointmentResponseDTO>(`/api/appointments/${id}`);

export const getAllAppointments = (page = 0, size = 20) =>
  apiGet<PageResponse<AppointmentResponseDTO>>("/api/appointments", { params: { page, size } });

export const getAppointmentsByPatientId = (patientId: number, page = 0, size = 20) =>
  apiGet<PageResponse<AppointmentResponseDTO>>(`/api/appointments/patient/${patientId}`, {
    params: { page, size },
  });

export const cancelAppointment = (id: number) =>
  apiPatch<AppointmentResponseDTO>(`/api/appointments/${id}/cancel`);

export const completeAppointment = (id: number) =>
  apiPatch<AppointmentResponseDTO>(`/api/appointments/${id}/complete`);

export const noShowAppointment = (id: number) =>
  apiPatch<AppointmentResponseDTO>(`/api/appointments/${id}/no-show`);

/** Notify Appointment — upcoming, still-scheduled appointments for a patient. */
export const getUpcomingNotifications = (patientId: number) =>
  apiGet<NotifyAppointmentResponseDTO[]>(`/api/appointments/patient/${patientId}/notifications`);