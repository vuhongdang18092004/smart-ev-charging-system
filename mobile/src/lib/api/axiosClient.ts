import { create, isAxiosError, isCancel } from 'axios';
import { AUTH_API } from '@/src/constants/apiEndpoints';
import { API_TIMEOUT_MS, MOBILE_API_URL } from '@/src/constants/config';
import type { ApiFailure } from '@/src/types/api';
import { ApiError } from './apiError';

const publicRoutes = new Set<string>(Object.values(AUTH_API).filter((path) => path !== AUTH_API.me));
export const axiosClient = create({ baseURL: MOBILE_API_URL, timeout: API_TIMEOUT_MS });

interface SessionTransport {
  accessToken(): string | undefined;
  refresh(): Promise<unknown>;
}

let session: SessionTransport | undefined;
export function configureSessionTransport(transport: SessionTransport) { session = transport; }

axiosClient.interceptors.request.use((request) => {
  if (!MOBILE_API_URL) throw new ApiError(undefined, 'error.api-config');
  if (request.url && !publicRoutes.has(request.url)) {
    const token = session?.accessToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
});

axiosClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!isAxiosError<Partial<ApiFailure>>(error) || isCancel(error)) throw error;
  const request = error.config;
  const transport = session;
  if (error.response?.status === 401 && request?.url && !publicRoutes.has(request.url)
      && !('sessionRetried' in request) && transport?.accessToken()) {
    const issued = request.headers.get('Authorization');
    if (issued === `Bearer ${transport.accessToken()}`) await transport.refresh();
    const retry = { ...request, sessionRetried: true };
    return axiosClient.request(retry);
  }
  throw new ApiError(error.response?.status, error.response?.data?.code);
});
