"use client";

import { useCallback, useState, type FormEvent } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseInput } from "@/components/base/base-input";
import { BaseModal } from "@/components/base/base-modal";
import { BasePagination } from "@/components/base/base-pagination";
import { BaseSelect } from "@/components/base/base-select";
import { BaseTable } from "@/components/base/base-table";
import { COPY } from "@/constants/management";
import {
  VOUCHER_COPY as copy,
  VOUCHER_STATUS_LABELS,
} from "@/constants/voucher";
import { WEB_ROLE } from "@/constants/web-auth";
import { useResource } from "@/hooks/use-resource";
import { voucherFiltersSchema } from "@/schemas/voucher";
import { getVoucherReferences, getVouchers } from "@/services/voucher-service";
import type { Voucher, VoucherFilters } from "@/types/voucher";
import type { WebUser } from "@/types/web-auth";
import { namedOptions } from "@/utils/management-options";
import { ResourceFeedback } from "../management/resource-feedback";
import { SectionHeading } from "../management/section-heading";
import { VoucherDetails } from "./voucher-details";
import { VoucherForm } from "./voucher-form";

const statusOptions = Object.entries(VOUCHER_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);
const dates = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

export function VoucherPage({ user }: { user: WebUser }) {
  const admin = user.role === WEB_ROLE.admin;
  const [filters, setFilters] = useState<VoucherFilters>({});
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string>();
  const load = useCallback(
    (signal: AbortSignal) => getVouchers(filters, page, signal),
    [filters, page],
  );
  const loadReferences = useCallback(
    (signal: AbortSignal) => getVoucherReferences(admin, signal),
    [admin],
  );
  const resource = useResource(load);
  const refs = useResource(loadReferences);
  const rows = resource.data;

  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = voucherFiltersSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!parsed.success) return;
    setFilters(parsed.data);
    setPage(0);
  }

  function refresh() {
    setPage(0);
    resource.refresh();
  }

  return (
    <div className="grid gap-6">
      <SectionHeading
        title={copy.title}
        description={copy.description}
        action={copy.create}
        onAction={() => setCreating(true)}
      />
      <section className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <form
          onSubmit={filter}
          className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          <BaseInput label={copy.search} name="keyword" />
          <BaseSelect
            label={COPY.status}
            name="status"
            options={[{ value: "", label: copy.all }, ...statusOptions]}
          />
          <BaseSelect
            label={COPY.station}
            name="stationId"
            options={[
              { value: "", label: copy.all },
              ...namedOptions(refs.data?.stations ?? []),
            ]}
          />
          <BaseButton type="submit" className="justify-self-start">
            {copy.filter}
          </BaseButton>
        </form>
        <ResourceFeedback {...refs} />
        <ResourceFeedback {...resource} />
        {rows && (
          <>
            {rows.content.length === 0 ? (
              <p>{copy.empty}</p>
            ) : (
              <BaseTable<Voucher>
                caption={copy.title}
                rows={rows.content}
                getRowKey={(v) => v.id}
                columns={[
                  {
                    id: "voucher",
                    header: copy.titleField,
                    render: (v) => (
                      <>
                        <strong>{v.title}</strong>
                        <br />
                        {v.code_prefix}
                      </>
                    ),
                  },
                  {
                    id: "status",
                    header: COPY.status,
                    render: (v) => (
                      <>
                        <span className="rounded-full border border-line px-2 py-1 text-xs font-medium">
                          {VOUCHER_STATUS_LABELS[v.status]}
                        </span>
                        {v.rejection_reason && (
                          <p className="mt-2 max-w-48 break-words text-xs">
                            {v.rejection_reason}
                          </p>
                        )}
                      </>
                    ),
                  },
                  {
                    id: "scope",
                    header: copy.scope,
                    render: (v) =>
                      v.station_name ?? v.brand_name ?? copy.global,
                  },
                  {
                    id: "count",
                    header: copy.progress,
                    render: (v) => `${v.claimed_count} / ${v.total_quantity}`,
                  },
                  {
                    id: "period",
                    header: copy.validity,
                    render: (v) => (
                      <>
                        {dates.format(new Date(v.valid_from))}
                        <br />
                        {dates.format(new Date(v.valid_to))}
                      </>
                    ),
                  },
                  {
                    id: "view",
                    header: COPY.actions,
                    render: (v) => (
                      <BaseButton onClick={() => setSelected(v.id)}>
                        {copy.detail}
                      </BaseButton>
                    ),
                  },
                ]}
              />
            )}
            <BasePagination
              page={page + 1}
              pageCount={rows.total_pages}
              onPageChange={(next) => setPage(next - 1)}
            />
          </>
        )}
      </section>
      {creating && (
        <BaseModal
          open
          wide
          title={copy.create}
          onClose={() => setCreating(false)}
        >
          <ResourceFeedback {...refs} />
          <VoucherForm
            user={user}
            references={refs.data}
            onSuccess={() => {
              setCreating(false);
              refresh();
            }}
          />
        </BaseModal>
      )}
      {selected && (
        <VoucherDetails
          key={selected}
          id={selected}
          user={user}
          references={refs.data}
          onSuccess={refresh}
          onClose={() => setSelected(undefined)}
          onDelete={() => {
            setSelected(undefined);
            refresh();
          }}
        />
      )}
    </div>
  );
}
