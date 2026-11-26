"use client";

import { useState } from "react";
import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import { COPY } from "@/constants/management";
import {
  VOUCHER_COPY as copy,
  VOUCHER_DISCOUNTS,
  VOUCHER_FIELDS,
  VOUCHER_SCOPES as scope,
  VOUCHER_STATUSES as status,
  VOUCHER_STATUS_LABELS,
} from "@/constants/voucher";
import { WEB_ROLE } from "@/constants/web-auth";
import { voucherSchema } from "@/schemas/voucher";
import { saveVoucher } from "@/services/voucher-service";
import type { VoucherFormProps, VoucherStatus } from "@/types/voucher";
import { namedOptions } from "@/utils/management-options";
import { ManagedForm } from "../management/managed-form";

function localDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 23);
}

export function VoucherForm({
  user,
  references,
  voucher,
  onSuccess,
}: VoucherFormProps) {
  const admin = user.role === WEB_ROLE.admin;
  const locked = (voucher?.claimed_count ?? 0) > 0;
  const [selected, setSelected] = useState<string>(
    voucher?.station_id || !admin
      ? scope.station
      : voucher?.brand_id
        ? scope.brand
        : scope.global,
  );
  const [target, setTarget] = useState<VoucherStatus>();
  const availableStatuses: VoucherStatus[] =
    !voucher || !admin
      ? []
      : voucher.status === status.active
        ? [status.inactive]
        : voucher.status === status.draft || voucher.status === status.inactive
          ? [status.active]
          : [];
  const submitLabel =
    target === status.active
      ? copy.publish
      : target === status.pending
        ? copy.submit
        : target === status.draft || !voucher
          ? copy.saveDraft
          : COPY.save;

  return (
    <ManagedForm
      submitLabel={submitLabel}
      secondarySubmit={
        !voucher
          ? {
              label: admin ? copy.publish : copy.submit,
              name: "status",
              value: admin ? status.active : status.pending,
            }
          : undefined
      }
      onSuccess={onSuccess}
      disabled={!references && !locked}
      submit={(form) => {
        const fields = Object.fromEntries(form);
        const originalTerms = {
          station_id: voucher?.station_id ?? undefined,
          brand_id: voucher?.brand_id ?? undefined,
          code_prefix: voucher?.code_prefix,
          discount_type: voucher?.discount_type,
          discount_value: voucher?.discount_value,
          max_discount_amount: voucher?.max_discount_amount ?? undefined,
          min_order_amount: voucher?.min_order_amount,
          valid_from: voucher?.valid_from,
          valid_to: voucher?.valid_to,
        };
        const body = voucherSchema.parse({
          ...fields,
          ...(locked ? originalTerms : {}),
          status: voucher ? target : (fields.status ?? status.draft),
        });
        if (voucher) {
          if (locked || fields.valid_from === localDate(voucher.valid_from))
            body.valid_from = voucher.valid_from;
          if (locked || fields.valid_to === localDate(voucher.valid_to))
            body.valid_to = voucher.valid_to;
        }
        return saveVoucher(body, voucher?.id);
      }}
    >
      <BaseInput
        name="title"
        label={copy.titleField}
        maxLength={VOUCHER_FIELDS.title}
        required
        defaultValue={voucher?.title}
      />
      <label className="grid gap-1 text-sm font-medium">
        {copy.descriptionField}
        <textarea
          name="description"
          defaultValue={voucher?.description ?? ""}
          className="min-h-24 rounded-md border border-current/30 bg-background px-3 py-2 font-normal"
        />
      </label>
      {locked && <p className="text-sm text-muted-foreground">{copy.locked}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <BaseInput
          name="code_prefix"
          label={copy.prefix}
          required
          disabled={locked}
          pattern="[A-Za-z0-9][A-Za-z0-9\-]*"
          maxLength={VOUCHER_FIELDS.prefix}
          defaultValue={voucher?.code_prefix}
        />
        <BaseInput
          name="total_quantity"
          label={copy.quantity}
          type="number"
          min={Math.max(1, voucher?.claimed_count ?? 0)}
          max={VOUCHER_FIELDS.quantity}
          required
          defaultValue={voucher?.total_quantity}
        />
        <BaseSelect
          name="discount_type"
          label={copy.discountType}
          disabled={locked}
          defaultValue={voucher?.discount_type ?? VOUCHER_DISCOUNTS.percent}
          options={[
            { value: VOUCHER_DISCOUNTS.percent, label: copy.percent },
            { value: VOUCHER_DISCOUNTS.fixed, label: copy.fixed },
          ]}
        />
        <BaseInput
          name="discount_value"
          label={copy.discount}
          disabled={locked}
          type="number"
          min="0.01"
          step="0.01"
          required
          defaultValue={voucher?.discount_value}
        />
        <BaseInput
          name="max_discount_amount"
          label={copy.maxDiscount}
          disabled={locked}
          type="number"
          min={0}
          step="0.01"
          defaultValue={voucher?.max_discount_amount ?? ""}
        />
        <BaseInput
          name="min_order_amount"
          label={copy.minOrder}
          disabled={locked}
          type="number"
          min={0}
          step="0.01"
          defaultValue={voucher?.min_order_amount ?? 0}
        />
        <BaseInput
          name="valid_from"
          label={copy.from}
          type="datetime-local"
          step="0.001"
          disabled={locked}
          required
          defaultValue={localDate(voucher?.valid_from)}
        />
        <BaseInput
          name="valid_to"
          label={copy.until}
          type="datetime-local"
          step="0.001"
          disabled={locked}
          required
          defaultValue={localDate(voucher?.valid_to)}
        />
      </div>
      {admin && (
        <BaseSelect
          label={copy.scope}
          value={selected}
          disabled={locked}
          onChange={(event) => setSelected(event.target.value)}
          options={[
            { value: scope.global, label: copy.global },
            { value: scope.brand, label: COPY.brand },
            { value: scope.station, label: COPY.station },
          ]}
        />
      )}
      {selected === scope.station && (
        <BaseSelect
          name="station_id"
          label={COPY.station}
          disabled={locked}
          required
          defaultValue={voucher?.station_id ?? ""}
          options={[
            { value: "", label: COPY.select },
            ...namedOptions(references?.stations ?? []),
          ]}
        />
      )}
      {selected === scope.brand && (
        <BaseSelect
          name="brand_id"
          label={COPY.brand}
          disabled={locked}
          required
          defaultValue={voucher?.brand_id ?? ""}
          options={[
            { value: "", label: COPY.select },
            ...namedOptions(references?.brands ?? []),
          ]}
        />
      )}
      {availableStatuses.length > 0 && (
        <BaseSelect
          label={COPY.actions}
          value={target ?? (voucher ? "" : status.draft)}
          onChange={(event) =>
            setTarget(
              availableStatuses.find((value) => value === event.target.value),
            )
          }
          options={[
            ...(voucher ? [{ value: "", label: COPY.save }] : []),
            ...availableStatuses.map((value) => ({
              value,
              label:
                value === status.active
                  ? copy.publish
                  : value === status.pending
                    ? copy.submit
                    : value === status.draft
                      ? copy.saveDraft
                      : VOUCHER_STATUS_LABELS[value],
            })),
          ]}
        />
      )}
    </ManagedForm>
  );
}
