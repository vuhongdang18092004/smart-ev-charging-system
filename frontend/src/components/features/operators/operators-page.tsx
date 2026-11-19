"use client";

import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import { COPY, OPERATOR_ACCESS, VALUE_LABELS } from "@/constants/management";
import { operatorSchema } from "@/schemas/management";
import { createOperator, getOperators } from "@/services/catalog-service";
import { valueOptions } from "@/utils/management-options";
import { CatalogPage } from "../management/catalog-page";

export function OperatorsPage() {
  return (
    <CatalogPage
      title={COPY.operators}
      description={COPY.operatorDescription}
      action={COPY.addOperator}
      load={getOperators}
      submit={async (form) => {
        await createOperator(operatorSchema.parse(Object.fromEntries(form)));
      }}
      columns={[
        { id: "name", header: COPY.name, render: (row) => row.name },
        { id: "email", header: COPY.email, render: (row) => row.email },
        {
          id: "access",
          header: COPY.access,
          render: (row) => VALUE_LABELS[row.access_type],
        },
      ]}
    >
      <BaseInput label={COPY.name} name="name" maxLength={100} required />
      <BaseInput
        label={COPY.email}
        name="email"
        type="email"
        maxLength={255}
        required
      />
      <BaseInput
        label={COPY.password}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <BaseSelect
        label={COPY.access}
        name="access_type"
        options={valueOptions(OPERATOR_ACCESS)}
        defaultValue="unknown"
      />
      <BaseInput label={COPY.endpoint} name="api_endpoint" maxLength={500} />
    </CatalogPage>
  );
}
