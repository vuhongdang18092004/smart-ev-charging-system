import { API_ENDPOINTS } from "@/constants/api-endpoints";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type {
  Brand,
  BrandRequest,
  UpdateBrandRequest,
} from "@/types/management";

export async function getBrands(signal?: AbortSignal) {
  return (
    await axiosClient.get<ApiSuccess<Brand[]>>(API_ENDPOINTS.brands, { signal })
  ).data.data;
}

export async function createBrand(body: BrandRequest) {
  return (await axiosClient.post<ApiSuccess<Brand>>(API_ENDPOINTS.brands, body))
    .data.data;
}

export async function deleteBrand(id: string) {
  await axiosClient.delete(API_ENDPOINTS.brand(id));
}

export async function updateBrand(id: string, body: UpdateBrandRequest) {
  return (
    await axiosClient.put<ApiSuccess<Brand>>(API_ENDPOINTS.brand(id), body)
  ).data.data;
}
