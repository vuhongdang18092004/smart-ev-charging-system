import { API_ENDPOINTS } from "@/constants/api-endpoints";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type {
  Operator,
  OperatorRequest,
  UpdateOperatorRequest,
  AllowedBrand,
  AllowedBrandsRequest,
} from "@/types/management";

export async function getOperators(signal?: AbortSignal) {
  return (
    await axiosClient.get<ApiSuccess<Operator[]>>(API_ENDPOINTS.operators, {
      signal,
    })
  ).data.data;
}

export async function createOperator(body: OperatorRequest) {
  return (
    await axiosClient.post<ApiSuccess<Operator>>(API_ENDPOINTS.operators, body)
  ).data.data;
}

export async function updateOperator(id: string, body: UpdateOperatorRequest) {
  return (
    await axiosClient.put<ApiSuccess<Operator>>(
      API_ENDPOINTS.operator(id),
      body,
    )
  ).data.data;
}

export async function getAllowedBrands(
  operatorId: string,
  signal?: AbortSignal,
) {
  return (
    await axiosClient.get<ApiSuccess<AllowedBrand[]>>(
      API_ENDPOINTS.operatorAllowedBrands(operatorId),
      { signal },
    )
  ).data.data;
}

export async function updateAllowedBrands(
  operatorId: string,
  body: AllowedBrandsRequest,
) {
  return (
    await axiosClient.put<ApiSuccess<AllowedBrand[]>>(
      API_ENDPOINTS.operatorAllowedBrands(operatorId),
      body,
    )
  ).data.data;
}
