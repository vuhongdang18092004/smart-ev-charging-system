"use client";

import { useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseModal } from "@/components/base/base-modal";
import { BaseTable } from "@/components/base/base-table";
import { COPY } from "@/constants/management";
import { useResource } from "@/hooks/use-resource";
import type { CatalogDialog, CatalogPageProps } from "@/types/management-ui";
import { ManagedForm } from "./managed-form";
import { ResourceFeedback } from "./resource-feedback";
import { SectionHeading } from "./section-heading";

export function CatalogPage<Row extends { id: string }>({
  title,
  description,
  action,
  load,
  columns,
  create,
  update,
  editTitle,
  fields,
  secondaryAction,
  canEdit = () => true,
  remove,
  toolbar,
}: CatalogPageProps<Row>) {
  const collection = useResource(load);
  const [dialog, setDialog] = useState<CatalogDialog<Row>>();

  function saved() {
    setDialog((current) => (current === dialog ? undefined : current));
    collection.refresh();
  }

  return (
    <div className="grid gap-6">
      <SectionHeading
        title={title}
        description={description}
        action={action}
        onAction={() => setDialog({ kind: "create" })}
      />
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        {toolbar}
        <ResourceFeedback {...collection} />
        {collection.data && (
          <>
            <p className="mb-3 text-sm text-slate-600">
              {COPY.total(collection.data.length)}
            </p>
            <BaseTable
              caption={title}
              columns={[
                ...columns,
                {
                  id: "actions",
                  header: COPY.actions,
                  render: (row) => (
                    <div className="flex flex-wrap gap-2">
                      {canEdit(row) && (
                        <BaseButton
                          onClick={() => setDialog({ kind: "edit", row })}
                        >
                          {COPY.editCatalogItem}
                        </BaseButton>
                      )}
                      {remove && canEdit(row) && (
                        <BaseButton
                          onClick={() => setDialog({ kind: "delete", row })}
                        >
                          {COPY.delete}
                        </BaseButton>
                      )}
                      {secondaryAction && (
                        <BaseButton
                          onClick={() => setDialog({ kind: "secondary", row })}
                        >
                          {secondaryAction.label}
                        </BaseButton>
                      )}
                    </div>
                  ),
                },
              ]}
              rows={collection.data}
              getRowKey={(row) => row.id}
            />
          </>
        )}
      </section>
      {dialog?.kind === "create" && (
        <BaseModal open title={action} onClose={() => setDialog(undefined)}>
          <ManagedForm
            submit={create}
            submitLabel={COPY.create}
            onSuccess={saved}
          >
            {fields()}
          </ManagedForm>
        </BaseModal>
      )}
      {dialog?.kind === "edit" && (
        <BaseModal open title={editTitle} onClose={() => setDialog(undefined)}>
          <ManagedForm
            submit={(form) => update(dialog.row, form)}
            submitLabel={COPY.save}
            onSuccess={saved}
          >
            {fields(dialog.row)}
          </ManagedForm>
        </BaseModal>
      )}
      {dialog?.kind === "delete" && remove && (
        <BaseModal
          open
          title={COPY.delete}
          onClose={() => setDialog(undefined)}
        >
          <ManagedForm
            submit={() => remove(dialog.row)}
            submitLabel={COPY.delete}
            onSuccess={saved}
          >
            <p>{COPY.confirmCatalogDelete}</p>
          </ManagedForm>
        </BaseModal>
      )}
      {dialog?.kind === "secondary" && secondaryAction && (
        <BaseModal
          open
          title={secondaryAction.label}
          onClose={() => setDialog(undefined)}
        >
          {secondaryAction.render(dialog.row, saved)}
        </BaseModal>
      )}
    </div>
  );
}
