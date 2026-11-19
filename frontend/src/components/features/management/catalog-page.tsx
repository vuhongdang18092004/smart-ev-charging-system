"use client";

import { useState } from "react";
import { BaseModal } from "@/components/base/base-modal";
import { BaseTable } from "@/components/base/base-table";
import { COPY } from "@/constants/management";
import { useResource } from "@/hooks/use-resource";
import type { CatalogPageProps } from "@/types/management-ui";
import { ManagedForm } from "./managed-form";
import { ResourceFeedback } from "./resource-feedback";
import { SectionHeading } from "./section-heading";

export function CatalogPage<Row extends { id: string }>({
  title,
  description,
  action,
  load,
  columns,
  submit,
  children,
}: CatalogPageProps<Row>) {
  const collection = useResource(load);
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <SectionHeading
        title={title}
        description={description}
        action={action}
        onAction={() => setOpen(true)}
      />
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <ResourceFeedback {...collection} />
        {collection.data && (
          <>
            <p className="mb-3 text-sm text-slate-600">
              {COPY.total(collection.data.length)}
            </p>
            <BaseTable
              caption={title}
              columns={columns}
              rows={collection.data}
              getRowKey={(row) => row.id}
            />
          </>
        )}
      </section>
      {open && (
        <BaseModal open title={action} onClose={() => setOpen(false)}>
          <ManagedForm
            submit={submit}
            submitLabel={COPY.create}
            onSuccess={() => {
              setOpen(false);
              collection.refresh();
            }}
          >
            {children}
          </ManagedForm>
        </BaseModal>
      )}
    </div>
  );
}
