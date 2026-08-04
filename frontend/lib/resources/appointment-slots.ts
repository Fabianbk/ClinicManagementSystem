import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  AppointmentSlotRequestDTO,
  AppointmentSlotResponseDTO,
  AppointmentSlotStatus,
} from "@/lib/types";

export const createAppointmentSlot = (dto: AppointmentSlotRequestDTO) =>
  apiPost<AppointmentSlotResponseDTO>("/api/appointment-slots", dto);

export const getAppointmentSlot = (id: number) =>
  apiGet<AppointmentSlotResponseDTO>(`/api/appointment-slots/${id}`);

/** All slots for a schedule, any status — doctor/admin view. */
export const getSlotsByScheduleId = (scheduleId: number) =>
  apiGet<AppointmentSlotResponseDTO[]>(`/api/appointment-slots/schedule/${scheduleId}`);

/** AVAILABLE slots only — the list shown to patients when booking. */
export const getAvailableSlotsByScheduleId = (scheduleId: number) =>
  apiGet<AppointmentSlotResponseDTO[]>(`/api/appointment-slots/schedule/${scheduleId}/available`);

/** Block or unblock a slot. Cannot be used to set BOOKED — that only happens via booking. */
export const updateSlotStatus = (id: number, status: AppointmentSlotStatus) =>
  apiPatch<AppointmentSlotResponseDTO>(`/api/appointment-slots/${id}/status`, undefined, {
    params: { status },
  });

export const deleteAppointmentSlot = (id: number) =>
  apiDelete(`/api/appointment-slots/${id}`);