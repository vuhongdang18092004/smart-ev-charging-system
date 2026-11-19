import { API_ENDPOINTS } from "@/constants/api-endpoints";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type {
  Brand,
  BrandRequest,
  ConnectorType,
  ConnectorTypeRequest,
  Operator,
  OperatorRequest,
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
export async function getConnectorTypes(signal?: AbortSignal) {
  return (
    await axiosClient.get<ApiSuccess<ConnectorType[]>>(
      API_ENDPOINTS.connectorTypes,
      { signal },
    )
  ).data.data;
}
export async function createConnectorType(body: ConnectorTypeRequest) {
  return (
    await axiosClient.post<ApiSuccess<ConnectorType>>(
      API_ENDPOINTS.connectorTypes,
      body,
    )
  ).data.data;
}
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
