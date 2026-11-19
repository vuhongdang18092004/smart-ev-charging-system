import axios from "axios";
import { UI_LABELS } from "@/constants/ui-labels";
import type { ApiErrorResponse } from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | undefined,
    readonly code: string | undefined,
    cause: unknown,
  ) {
    super(message, { cause });
    this.name = "ApiError";
  }
}

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api",
});

axiosClient.interceptors.response.use(undefined, (error: unknown) => {
  if (
    !axios.isAxiosError<Partial<ApiErrorResponse>>(error) ||
    axios.isCancel(error)
  ) {
    throw error;
  }

  const data = error.response?.data;
  throw new ApiError(
    typeof data?.message === "string" ? data.message : UI_LABELS.requestFailed,
    error.response?.status,
    typeof data?.code === "string" ? data.code : undefined,
    error,
  );
});

export default axiosClient;
