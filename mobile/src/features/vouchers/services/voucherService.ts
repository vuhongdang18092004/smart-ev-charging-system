import { axiosClient } from '@/src/lib/api/axiosClient';
import type { AvailableVoucher, VoucherPage, WalletStatus, WalletVoucher } from '../types/voucher';

const vouchers = '/driver/vouchers';
const userVouchers = '/driver/user-vouchers';
const size = 10;

export const voucherService = {
  async available(page: number, signal: AbortSignal) {
    return (await axiosClient.get<{ data: VoucherPage<AvailableVoucher> }>(`${vouchers}/available`, {
      signal, params: { page, size },
    })).data.data;
  },
  async wallet(status: WalletStatus, page: number, signal: AbortSignal) {
    return (await axiosClient.get<{ data: VoucherPage<WalletVoucher> }>(`${vouchers}/my`, {
      signal, params: { status, page, size },
    })).data.data;
  },
  async claim(id: string) {
    return (await axiosClient.post<{ data: WalletVoucher }>(`${vouchers}/${encodeURIComponent(id)}/claim`)).data.data;
  },
  async downloadQr(id: string) {
    return (await axiosClient.post<{ data: WalletVoucher }>(
      `${userVouchers}/${encodeURIComponent(id)}/download-qr`,
    )).data.data;
  },
};
