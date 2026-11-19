"use client";

import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import { BRAND_TYPES, COPY, VALUE_LABELS } from "@/constants/management";
import { brandSchema } from "@/schemas/management";
import { createBrand, getBrands } from "@/services/catalog-service";
import { valueOptions } from "@/utils/management-options";
import { CatalogPage } from "../management/catalog-page";

export function BrandsPage() {
  return (
    <CatalogPage
      title={COPY.brands}
      description={COPY.brandDescription}
      action={COPY.addBrand}
      load={getBrands}
      submit={async (form) => {
        await createBrand(brandSchema.parse(Object.fromEntries(form)));
      }}
      columns={[
        { id: "name", header: COPY.name, render: (row) => row.name },
        {
          id: "type",
          header: COPY.type,
          render: (row) => (row.type ? VALUE_LABELS[row.type] : COPY.empty),
        },
      ]}
    >
      <BaseInput label={COPY.name} name="name" maxLength={100} required />
      <BaseSelect
        label={COPY.type}
        name="type"
        options={valueOptions(BRAND_TYPES)}
        defaultValue="both"
      />
      <BaseInput label={COPY.logo} name="logo_url" maxLength={500} />
      <BaseInput label={COPY.website} name="website" maxLength={500} />
    </CatalogPage>
  );
}
