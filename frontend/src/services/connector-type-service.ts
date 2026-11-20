import { API_ENDPOINTS } from "@/constants/api-endpoints";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type {
  ConnectorType,
  ConnectorTypeRequest,
  UpdateConnectorTypeRequest,
} from "@/types/management";

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

export async function updateConnectorType(
  id: string,
  body: UpdateConnectorTypeRequest,
) {
  return (
    await axiosClient.put<ApiSuccess<ConnectorType>>(
      API_ENDPOINTS.connectorType(id),
      body,
    )
  ).data.data;
}
