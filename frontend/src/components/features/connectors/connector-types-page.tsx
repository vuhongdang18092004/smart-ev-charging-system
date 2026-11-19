"use client";

import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import { COPY, CURRENT_TYPES } from "@/constants/management";
import { connectorTypeSchema } from "@/schemas/management";
import {
  createConnectorType,
  getConnectorTypes,
} from "@/services/catalog-service";
import { valueOptions } from "@/utils/management-options";
import { CatalogPage } from "../management/catalog-page";

export function ConnectorTypesPage() {
  return (
    <CatalogPage
      title={COPY.connectorTypes}
      description={COPY.connectorTypeDescription}
      action={COPY.addConnectorType}
      load={getConnectorTypes}
      submit={async (form) => {
        await createConnectorType(
          connectorTypeSchema.parse(Object.fromEntries(form)),
        );
      }}
      columns={[
        { id: "code", header: COPY.code, render: (row) => row.code },
        { id: "name", header: COPY.name, render: (row) => row.name },
        {
          id: "current",
          header: COPY.currentType,
          render: (row) => row.current_type,
        },
      ]}
    >
      <BaseInput label={COPY.code} name="code" maxLength={20} required />
      <BaseInput label={COPY.name} name="name" maxLength={100} required />
      <BaseSelect
        label={COPY.currentType}
        name="current_type"
        options={valueOptions(CURRENT_TYPES)}
      />
      <BaseInput
        label={COPY.sortOrder}
        name="sort_order"
        inputMode="numeric"
        defaultValue={0}
        required
      />
      <label className="flex items-center gap-2 text-sm">
        <input name="active" type="checkbox" defaultChecked />
        {COPY.active}
      </label>
    </CatalogPage>
  );
}
