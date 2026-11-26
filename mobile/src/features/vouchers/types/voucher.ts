export type WalletStatus = 'CLAIMED' | 'USED' | 'EXPIRED';

export interface VoucherOffer {
  id: string;
  title: string;
  description: string | null;
  station_name: string | null;
  brand_name: string | null;
  discount_type: 'PERCENT' | 'FIXED_AMOUNT';
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number;
  total_quantity: number;
  claimed_count: number;
  valid_to: string;
}

export interface AvailableVoucher extends VoucherOffer {
  is_claimed: boolean;
}

export interface WalletVoucher {
  id: string;
  voucher: VoucherOffer;
  redeem_code: string;
  status: WalletStatus;
  used_at: string | null;
  qr_text: string | null;
}

export interface VoucherPage<T> {
  content: T[];
  total_pages: number;
}

export type VoucherView = 'available' | WalletStatus;
export type VoucherRows = { view: 'available'; items: AvailableVoucher[] } |
  { view: WalletStatus; items: WalletVoucher[] };
