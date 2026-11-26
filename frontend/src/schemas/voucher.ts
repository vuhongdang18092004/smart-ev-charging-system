import { z } from "zod";
import {
  VOUCHER_COPY as copy,
  VOUCHER_DISCOUNTS,
  VOUCHER_FIELDS,
  VOUCHER_STATUSES,
} from "@/constants/voucher";

const optional = (v: unknown) =>
  typeof v === "string" ? v.trim() || undefined : v;
const amount = z
  .union([
    z.number(),
    z
      .string()
      .regex(/^\d+(?:\.\d{1,2})?$/)
      .transform(Number),
  ])
  .pipe(z.number().min(0).max(VOUCHER_FIELDS.money));
const date = z
  .string()
  .refine((value) => Number.isFinite(Date.parse(value)), copy.invalidDates)
  .transform((value) => new Date(value).toISOString());
export const voucherSchema = z
  .object({
    station_id: z.preprocess(optional, z.uuid().optional()),
    brand_id: z.preprocess(optional, z.uuid().optional()),
    title: z.string().trim().min(1, copy.required).max(VOUCHER_FIELDS.title),
    code_prefix: z
      .string()
      .trim()
      .max(VOUCHER_FIELDS.prefix)
      .regex(/^[A-Za-z0-9][A-Za-z0-9-]*$/, copy.prefixHint),
    description: z.preprocess(optional, z.string().optional()),
    discount_type: z.enum(VOUCHER_DISCOUNTS),
    discount_value: amount.refine((v) => v > 0, copy.invalidAmount),
    max_discount_amount: z.preprocess(optional, amount.optional()),
    min_order_amount: z.preprocess(optional, amount.optional()),
    total_quantity: z.coerce.number().int().min(1).max(VOUCHER_FIELDS.quantity),
    valid_from: date,
    valid_to: date,
    status: z.enum(VOUCHER_STATUSES).optional(),
  })
  .refine((v) => v.valid_to > v.valid_from, copy.invalidDates)
  .refine(
    (v) =>
      v.discount_type !== VOUCHER_DISCOUNTS.percent || v.discount_value <= 100,
    copy.invalidAmount,
  );

export const voucherFiltersSchema = z.object({
  keyword: z.preprocess(optional, z.string().optional()),
  status: z.preprocess(optional, z.enum(VOUCHER_STATUSES).optional()),
  stationId: z.preprocess(optional, z.uuid().optional()),
});
export const voucherRejectSchema = z.object({
  rejection_reason: z.string().trim().min(1, copy.required),
});
