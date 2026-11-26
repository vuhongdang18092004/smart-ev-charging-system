import type { VOUCHER_DISCOUNTS, VOUCHER_STATUSES } from "@/constants/voucher";
import type { WebUser } from "./web-auth";

export type VoucherStatus =
  (typeof VOUCHER_STATUSES)[keyof typeof VOUCHER_STATUSES];
export type VoucherDiscount =
  (typeof VOUCHER_DISCOUNTS)[keyof typeof VOUCHER_DISCOUNTS];
export type VoucherAction = "submit" | "approve" | "reject";
export type VoucherDialogAction = VoucherAction | "edit" | "delete";

export interface VoucherRequest {
  code_prefix: string;
  title: string;
  description?: string;
  station_id?: string;
  brand_id?: string;
  discount_type: VoucherDiscount;
  discount_value: number;
  max_discount_amount?: number;
  min_order_amount?: number;
  total_quantity: number;
  valid_from: string;
  valid_to: string;
  status?: VoucherStatus;
}

export interface Voucher extends Omit<
  VoucherRequest,
  "description" | "status" | "station_id" | "brand_id" | "max_discount_amount"
> {
  id: string;
  creator_id: string;
  station_id: string | null;
  station_name: string | null;
  brand_id: string | null;
  brand_name: string | null;
  description: string | null;
  max_discount_amount: number | null;
  min_order_amount: number;
  status: VoucherStatus;
  claimed_count: number;
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface VoucherFilters {
  keyword?: string;
  status?: VoucherStatus;
  stationId?: string;
}

export interface VoucherReferences {
  stations: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export interface VoucherFormProps {
  user: WebUser;
  references?: VoucherReferences;
  voucher?: Voucher;
  onSuccess: () => void;
}

export interface VoucherDetailsProps extends Omit<VoucherFormProps, "voucher"> {
  id: string;
  onClose: () => void;
  onDelete: () => void;
}
