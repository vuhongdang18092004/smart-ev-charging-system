"use client";

import { useCallback, useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseInput } from "@/components/base/base-input";
import { BaseModal } from "@/components/base/base-modal";
import {
  VOUCHER_COPY as copy,
  VOUCHER_DISCOUNTS,
  VOUCHER_STATUSES as status,
  VOUCHER_STATUS_LABELS,
} from "@/constants/voucher";
import { WEB_ROLE } from "@/constants/web-auth";
import { useResource } from "@/hooks/use-resource";
import { voucherRejectSchema } from "@/schemas/voucher";
import {
  changeVoucher,
  deleteVoucher,
  getVoucher,
} from "@/services/voucher-service";
import type { VoucherDetailsProps, VoucherDialogAction } from "@/types/voucher";
import { ManagedForm } from "../management/managed-form";
import { ResourceFeedback } from "../management/resource-feedback";
import { VoucherForm } from "./voucher-form";

const confirmations = {
  approve: copy.confirmApprove,
  submit: copy.confirmSubmit,
  delete: copy.confirmDelete,
};
const dates = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});
const numbers = new Intl.NumberFormat("vi-VN");
const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function VoucherDetails({
  user,
  id,
  references,
  onClose,
  onDelete,
  onSuccess,
}: VoucherDetailsProps) {
  const [action, setAction] = useState<VoucherDialogAction>();
  const load = useCallback(
    (signal: AbortSignal) => getVoucher(id, signal),
    [id],
  );
  const resource = useResource(load);
  const v = resource.data;
  const admin = user.role === WEB_ROLE.admin;
  const ownDraft =
    v &&
    v.creator_id === user.id &&
    (v.status === status.draft || v.status === status.rejected);

  function saved() {
    setAction(undefined);
    resource.refresh();
    onSuccess();
  }

  return (
    <BaseModal
      open
      wide
      title={action ? copy[action] : copy.detail}
      onClose={onClose}
    >
      <ResourceFeedback {...resource} />
      {v && !action && (
        <div className="grid gap-4">
          <div>
            <p className="text-sm">
              {VOUCHER_STATUS_LABELS[v.status]} · {v.code_prefix}
            </p>
            <h3 className="break-words text-2xl font-semibold">{v.title}</h3>
            {v.description && (
              <p className="mt-2 whitespace-pre-wrap break-words">
                {v.description}
              </p>
            )}
          </div>
          <dl className="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium">{copy.discount}</dt>
              <dd>
                {v.discount_type === VOUCHER_DISCOUNTS.percent
                  ? `${numbers.format(v.discount_value)}%`
                  : money.format(v.discount_value)}
              </dd>
            </div>
            <div>
              <dt className="font-medium">{copy.scope}</dt>
              <dd>{v.station_name ?? v.brand_name ?? copy.global}</dd>
            </div>
            <div>
              <dt className="font-medium">{copy.progress}</dt>
              <dd>
                {v.claimed_count} / {v.total_quantity}
              </dd>
            </div>
            <div>
              <dt className="font-medium">{copy.validity}</dt>
              <dd>
                {dates.format(new Date(v.valid_from))} –{" "}
                {dates.format(new Date(v.valid_to))}
              </dd>
            </div>
            {v.max_discount_amount !== null && (
              <div>
                <dt>{copy.maxDiscount}</dt>
                <dd>{money.format(v.max_discount_amount)}</dd>
              </div>
            )}
            <div>
              <dt>{copy.minOrder}</dt>
              <dd>{money.format(v.min_order_amount)}</dd>
            </div>
          </dl>
          {v.rejection_reason && (
            <div className="rounded-lg border border-line p-4">
              <p className="font-medium">{copy.reason}</p>
              <p className="whitespace-pre-wrap break-words">
                {v.rejection_reason}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(admin || ownDraft) && (
              <>
                <BaseButton onClick={() => setAction("edit")}>
                  {copy.edit}
                </BaseButton>
                <BaseButton onClick={() => setAction("delete")}>
                  {copy.delete}
                </BaseButton>
              </>
            )}
            {!admin && ownDraft && (
              <BaseButton onClick={() => setAction("submit")}>
                {copy.submit}
              </BaseButton>
            )}
            {admin && v.status === status.pending && (
              <>
                <BaseButton onClick={() => setAction("approve")}>
                  {copy.approve}
                </BaseButton>
                <BaseButton onClick={() => setAction("reject")}>
                  {copy.reject}
                </BaseButton>
              </>
            )}
          </div>
        </div>
      )}
      {v && action && (
        <div className="grid gap-4">
          <BaseButton
            className="justify-self-start"
            onClick={() => setAction(undefined)}
          >
            {copy.back}
          </BaseButton>
          {action === "edit" ? (
            <VoucherForm
              user={user}
              references={references}
              voucher={v}
              onSuccess={saved}
            />
          ) : (
            <ManagedForm
              key={action}
              submitLabel={copy[action]}
              onSuccess={action === "delete" ? onDelete : saved}
              submit={(form) => {
                if (action === "delete") return deleteVoucher(id);
                if (action === "reject")
                  return changeVoucher(
                    id,
                    action,
                    voucherRejectSchema.parse(Object.fromEntries(form))
                      .rejection_reason,
                  );
                return changeVoucher(id, action);
              }}
            >
              {action === "reject" ? (
                <BaseInput
                  name="rejection_reason"
                  label={copy.reason}
                  required
                />
              ) : (
                <p>{confirmations[action]}</p>
              )}
            </ManagedForm>
          )}
        </div>
      )}
    </BaseModal>
  );
}
