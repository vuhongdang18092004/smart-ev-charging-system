import axios from "axios";
import { WEB_AUTH_ROUTES } from "@/constants/web-auth";
import { refreshWebSession } from "@/services/web-auth-service";
import { ApiError } from "./api-error";
import { UI_LABELS } from "@/constants/ui-labels";
import type { ApiErrorResponse } from "@/types/api";

export { ApiError } from "./api-error";

const axiosClient = axios.create({
  baseURL: WEB_AUTH_ROUTES.bff,
});

axiosClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (
    !axios.isAxiosError<Partial<ApiErrorResponse>>(error) ||
    axios.isCancel(error)
  ) {
    throw error;
  }

  const config = error.config;
  if (
    error.response?.status === 401 &&
    config &&
    !("webSessionRetried" in config)
  ) {
    await refreshWebSession().catch((cause: unknown) => {
      if (
        typeof window !== "undefined" &&
        cause instanceof ApiError &&
        (cause.status === 401 || cause.status === 403)
      ) {
        window.location.replace(WEB_AUTH_ROUTES.login);
      }
      throw cause;
    });
    const retry = { ...config, webSessionRetried: true };
    return axiosClient.request(retry);
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
