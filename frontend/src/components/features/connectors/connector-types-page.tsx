"use client";

import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import {
  CATALOG_DEFAULTS,
  CATALOG_LIMITS,
  CONNECTOR_ACTIVITY,
  COPY,
  CURRENT_TYPES,
} from "@/constants/management";
import {
  connectorTypeSchema,
  updateConnectorTypeSchema,
} from "@/schemas/management";
import {
  createConnectorType,
  getConnectorTypes,
  updateConnectorType,
} from "@/services/connector-type-service";
import { valueOptions } from "@/utils/management-options";
import { CatalogPage } from "../management/catalog-page";

export function ConnectorTypesPage() {
  return (
    <CatalogPage
      title={COPY.connectorTypes}
      description={COPY.connectorTypeDescription}
      action={COPY.addConnectorType}
      load={getConnectorTypes}
      create={(form) =>
        createConnectorType(connectorTypeSchema.parse(Object.fromEntries(form)))
      }
      editTitle={COPY.editConnectorType}
      update={(row, form) =>
        updateConnectorType(
          row.id,
          updateConnectorTypeSchema.parse(Object.fromEntries(form)),
        )
      }
      fields={(row) => (
        <>
          <BaseInput
            label={COPY.code}
            name="code"
            maxLength={CATALOG_LIMITS.code}
            defaultValue={row?.code}
            required
          />
          <BaseInput
            label={COPY.name}
            name="name"
            maxLength={CATALOG_LIMITS.name}
            defaultValue={row?.name}
            required
          />
          <BaseSelect
            label={COPY.currentType}
            name="current_type"
            options={valueOptions(CURRENT_TYPES)}
            defaultValue={row?.current_type}
          />
          <BaseInput
            label={COPY.sortOrder}
            name="sort_order"
            inputMode="numeric"
            defaultValue={
              row ? (row.sort_order ?? "") : CATALOG_DEFAULTS.sortOrder
            }
            required={!row}
          />
          {row ? (
            <BaseSelect
              label={COPY.active}
              name="is_active"
              defaultValue={
                row.is_active == null
                  ? ""
                  : row.is_active
                    ? CONNECTOR_ACTIVITY.active
                    : CONNECTOR_ACTIVITY.inactive
              }
              options={[
                { value: "", label: COPY.empty },
                { value: CONNECTOR_ACTIVITY.active, label: COPY.enabled },
                { value: CONNECTOR_ACTIVITY.inactive, label: COPY.disabled },
              ]}
            />
          ) : (
            <label className="flex items-center gap-2 text-sm">
              <input name="active" type="checkbox" defaultChecked />
              {COPY.active}
            </label>
          )}
        </>
      )}
      columns={[
        { id: "code", header: COPY.code, render: (row) => row.code },
        { id: "name", header: COPY.name, render: (row) => row.name },
        {
          id: "current",
          header: COPY.currentType,
          render: (row) => row.current_type,
        },
      ]}
    />
  );
}
