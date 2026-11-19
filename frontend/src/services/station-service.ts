import { API_ENDPOINTS } from "@/constants/api-endpoints";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type {
  Connector,
  ConnectorRequest,
  CreateStationRequest,
  PaginatedResponse,
  Station,
  StationDetail,
  StationFilters,
  StationRequest,
} from "@/types/management";

export async function getStations(
  filters: StationFilters,
  signal?: AbortSignal,
) {
  const { keyword, brandId, operatorId, status, page, size } = filters;
  return (
    await axiosClient.get<ApiSuccess<PaginatedResponse<Station>>>(
      API_ENDPOINTS.stations,
      {
        signal,
        params: {
          keyword: keyword.trim() || undefined,
          brandId: brandId || undefined,
          operatorId: operatorId || undefined,
          status: status || undefined,
          page,
          size,
        },
      },
    )
  ).data.data;
}
export async function getStation(id: string, signal?: AbortSignal) {
  return (
    await axiosClient.get<ApiSuccess<StationDetail>>(
      API_ENDPOINTS.station(id),
      { signal },
    )
  ).data.data;
}
export async function createStation(body: CreateStationRequest) {
  return (
    await axiosClient.post<ApiSuccess<StationDetail>>(
      API_ENDPOINTS.stations,
      body,
    )
  ).data.data;
}
export async function updateStation(id: string, body: StationRequest) {
  return (
    await axiosClient.put<ApiSuccess<Station>>(API_ENDPOINTS.station(id), body)
  ).data.data;
}
export async function deleteStation(id: string) {
  await axiosClient.delete(API_ENDPOINTS.station(id));
}
export async function addConnector(stationId: string, body: ConnectorRequest) {
  return (
    await axiosClient.post<ApiSuccess<Connector>>(
      API_ENDPOINTS.stationConnectors(stationId),
      body,
    )
  ).data.data;
}
export async function updateConnector(id: string, body: ConnectorRequest) {
  return (
    await axiosClient.put<ApiSuccess<Connector>>(
      API_ENDPOINTS.connector(id),
      body,
    )
  ).data.data;
}
export async function deleteConnector(id: string) {
  await axiosClient.delete(API_ENDPOINTS.connector(id));
}
