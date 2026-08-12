import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import type { PrincipleRequestDTO, PrincipleResponseDTO, HealthProfileRequestDTO, HealthProfileResponseDTO } from "@/lib/types";
import type {
  PageResponse,
  WorkingScheduleRequestDTO,
  WorkingScheduleResponseDTO,
} from "@/lib/types";

export const getWorkingSchedules = (page = 0, size = 20) =>
  apiGet<PageResponse<WorkingScheduleResponseDTO>>("/api/working-schedules", { params: { page, size } });

export const getWorkingSchedulesByDoctor = (doctorId: number) =>
  apiGet<WorkingScheduleResponseDTO[]>(`/api/working-schedules/doctor/${doctorId}`);

export const createWorkingSchedule = (dto: WorkingScheduleRequestDTO) =>
  apiPost<WorkingScheduleResponseDTO>("/api/working-schedules", dto);

export const updateWorkingSchedule = (id: number, dto: WorkingScheduleRequestDTO) =>
  apiPut<WorkingScheduleResponseDTO>(`/api/working-schedules/${id}`, dto);

export const deleteWorkingSchedule = (id: number) =>
  apiDelete(`/api/working-schedules/${id}`);

export const updatePrinciple = (patientId: number, dto: PrincipleRequestDTO) =>
  apiPut<PrincipleResponseDTO>(`/api/patients/${patientId}/principle`, dto);

export const updateHealthProfile = (patientId: number, dto: HealthProfileRequestDTO) =>
  apiPut<HealthProfileResponseDTO>(`/api/patients/${patientId}/health-profile`, dto);