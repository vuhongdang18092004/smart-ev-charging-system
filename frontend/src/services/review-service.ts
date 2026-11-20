import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { FEEDBACK_PAGE_SIZE } from "@/constants/station-media";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type { PaginatedResponse } from "@/types/management";
import type {
  CreateReviewRequest,
  Review,
  UpdateReviewRequest,
} from "@/types/station-feedback";

export async function getReviews(
  stationId: string,
  page: number,
  signal?: AbortSignal,
) {
  return (
    await axiosClient.get<ApiSuccess<PaginatedResponse<Review>>>(
      API_ENDPOINTS.stationReviews(stationId),
      { signal, params: { page, size: FEEDBACK_PAGE_SIZE } },
    )
  ).data.data;
}
export async function getReview(id: string, signal?: AbortSignal) {
  return (
    await axiosClient.get<ApiSuccess<Review>>(API_ENDPOINTS.review(id), {
      signal,
    })
  ).data.data;
}
export async function createReview(
  stationId: string,
  body: CreateReviewRequest,
) {
  return (
    await axiosClient.post<ApiSuccess<Review>>(
      API_ENDPOINTS.stationReviews(stationId),
      body,
    )
  ).data.data;
}
export async function updateReview(id: string, body: UpdateReviewRequest) {
  return (
    await axiosClient.put<ApiSuccess<Review>>(API_ENDPOINTS.review(id), body)
  ).data.data;
}
export async function deleteReview(id: string) {
  await axiosClient.delete(API_ENDPOINTS.review(id));
}
