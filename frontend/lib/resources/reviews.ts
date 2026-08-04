import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import type { PageResponse, ReviewRequestDTO, ReviewResponseDTO } from "@/lib/types";

export const createReview = (dto: ReviewRequestDTO) =>
  apiPost<ReviewResponseDTO>("/api/reviews", dto);

export const getReview = (id: number) =>
  apiGet<ReviewResponseDTO>(`/api/reviews/${id}`);

export const getReviewByPatientId = (patientId: number) =>
  apiGet<ReviewResponseDTO>(`/api/reviews/patient/${patientId}`);

export const getAllReviews = (page = 0, size = 20) =>
  apiGet<PageResponse<ReviewResponseDTO>>("/api/reviews", { params: { page, size } });

export const updateReview = (id: number, dto: ReviewRequestDTO) =>
  apiPut<ReviewResponseDTO>(`/api/reviews/${id}`, dto);