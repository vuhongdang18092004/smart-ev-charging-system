import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { VOUCHER_PAGE_SIZE } from "@/constants/voucher";
import axiosClient from "@/lib/axios-client";
import type { ApiSuccess } from "@/types/api";
import type { PaginatedResponse } from "@/types/management";
import type {
  Voucher,
  VoucherAction,
  VoucherFilters,
  VoucherRequest,
} from "@/types/voucher";
import { getBrands } from "./brand-service";
import { getStations } from "./station-service";

export async function getVouchers(
  filters: VoucherFilters,
  page: number,
  signal: AbortSignal,
) {
  const { data } = await axiosClient.get<
    ApiSuccess<PaginatedResponse<Voucher>>
  >(API_ENDPOINTS.vouchers, {
    params: { ...filters, page, size: VOUCHER_PAGE_SIZE },
    signal,
  });
  return data.data;
}

export async function getVoucher(id: string, signal: AbortSignal) {
  return (
    await axiosClient.get<ApiSuccess<Voucher>>(API_ENDPOINTS.voucher(id), {
      signal,
    })
  ).data.data;
}

export async function saveVoucher(body: VoucherRequest, id?: string) {
  if (id) await axiosClient.put(API_ENDPOINTS.voucher(id), body);
  else await axiosClient.post(API_ENDPOINTS.vouchers, body);
}

export async function changeVoucher(
  id: string,
  action: VoucherAction,
  reason?: string,
) {
  await axiosClient.post(
    API_ENDPOINTS.voucherAction(id, action),
    reason ? { rejection_reason: reason } : {},
  );
}

export async function deleteVoucher(id: string) {
  await axiosClient.delete(API_ENDPOINTS.voucher(id));
}

async function stationOptions(signal: AbortSignal) {
  const options = [];
  for (let page = 0; ; page += 1) {
    const result = await getStations(
      {
        keyword: "",
        brandId: "",
        operatorId: "",
        status: "",
        locationType: "",
        parkingFeeType: "",
        page,
        size: 100,
      },
      signal,
    );
    options.push(...result.content.map(({ id, name }) => ({ id, name })));
    if (page + 1 >= result.total_pages) return options;
  }
}

export async function getVoucherReferences(
  admin: boolean,
  signal: AbortSignal,
) {
  const [stations, brands] = await Promise.all([
    stationOptions(signal),
    admin ? getBrands(signal) : [],
  ]);
  return { stations, brands };
}
