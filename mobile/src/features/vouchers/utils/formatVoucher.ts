import { VOUCHER_COPY as copy } from '../constants';
import type { VoucherOffer } from '../types/voucher';

const numbers = new Intl.NumberFormat('vi-VN');
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const dates = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh',
});

export const deadline = (value: string) => dates.format(new Date(value));
export const money = (value: number) => currency.format(value);
export const discount = (voucher: VoucherOffer) => voucher.discount_type === 'PERCENT'
  ? `${numbers.format(voucher.discount_value)}%` : money(voucher.discount_value);
export const scope = (voucher: VoucherOffer) => voucher.station_name ?? voucher.brand_name ?? copy.global;
