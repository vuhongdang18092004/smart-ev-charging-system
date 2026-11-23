import { API_ENDPOINTS } from "@/constants/api-endpoints";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type { PaginatedResponse } from "@/types/management";
import type { VehicleInfo, VehicleInfoRequest } from "@/types/vehicle-info";

export async function getVehicleInfoList(
  keyword: string,
  brandId: string,
  signal: AbortSignal,
) {
  const rows: VehicleInfo[] = [];
  for (let page = 0; ; page += 1) {
    const response = await axiosClient.get<
      ApiSuccess<PaginatedResponse<VehicleInfo>>
    >(API_ENDPOINTS.vehicleInfoList, {
      params: { keyword, brandId: brandId || undefined, page, size: 100 },
      signal,
    });
    rows.push(...response.data.data.content);
    if (page + 1 >= response.data.data.total_pages) return rows;
  }
}

export async function getVehicleInfo(id: string, signal: AbortSignal) {
  return (
    await axiosClient.get<ApiSuccess<VehicleInfo>>(
      API_ENDPOINTS.vehicleInfo(id),
      { signal },
    )
  ).data.data;
}

export async function saveVehicleInfo(body: VehicleInfoRequest, id?: string) {
  if (id) await axiosClient.put(API_ENDPOINTS.vehicleInfo(id), body);
  else await axiosClient.post(API_ENDPOINTS.vehicleInfoList, body);
}

export async function deleteVehicleInfo(id: string) {
  await axiosClient.delete(API_ENDPOINTS.vehicleInfo(id));
}
