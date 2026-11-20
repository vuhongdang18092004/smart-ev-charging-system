import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { FEEDBACK_PAGE_SIZE } from "@/constants/station-media";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type { PaginatedResponse } from "@/types/management";
import type {
  StationReport,
  StationReportRequest,
} from "@/types/station-feedback";

export async function getStationReports(
  stationId: string,
  page: number,
  signal?: AbortSignal,
) {
  return (
    await axiosClient.get<ApiSuccess<PaginatedResponse<StationReport>>>(
      API_ENDPOINTS.stationReports(stationId),
      { signal, params: { page, size: FEEDBACK_PAGE_SIZE } },
    )
  ).data.data;
}
export async function getStationReport(id: string, signal?: AbortSignal) {
  return (
    await axiosClient.get<ApiSuccess<StationReport>>(
      API_ENDPOINTS.stationReport(id),
      { signal },
    )
  ).data.data;
}
export async function createStationReport(
  stationId: string,
  body: StationReportRequest,
) {
  return (
    await axiosClient.post<ApiSuccess<StationReport>>(
      API_ENDPOINTS.stationReports(stationId),
      body,
    )
  ).data.data;
}
