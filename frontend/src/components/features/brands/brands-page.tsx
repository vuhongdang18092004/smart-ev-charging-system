"use client";

import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import {
  BRAND_TYPES,
  CATALOG_DEFAULTS,
  CATALOG_LIMITS,
  COPY,
  VALUE_LABELS,
} from "@/constants/management";
import { brandSchema, updateBrandSchema } from "@/schemas/management";
import { createBrand, getBrands, updateBrand } from "@/services/brand-service";
import { valueOptions } from "@/utils/management-options";
import { CatalogPage } from "../management/catalog-page";

export function BrandsPage() {
  return (
    <CatalogPage
      title={COPY.brands}
      description={COPY.brandDescription}
      action={COPY.addBrand}
      load={getBrands}
      create={(form) =>
        createBrand(brandSchema.parse(Object.fromEntries(form)))
      }
      editTitle={COPY.editBrand}
      update={(row, form) =>
        updateBrand(row.id, updateBrandSchema.parse(Object.fromEntries(form)))
      }
      fields={(row) => (
        <>
          <BaseInput
            label={COPY.name}
            name="name"
            maxLength={CATALOG_LIMITS.name}
            defaultValue={row?.name}
            required
          />
          <BaseSelect
            label={COPY.type}
            name="type"
            options={
              row
                ? [
                    { value: "", label: COPY.empty },
                    ...valueOptions(BRAND_TYPES),
                  ]
                : valueOptions(BRAND_TYPES)
            }
            defaultValue={row ? (row.type ?? "") : CATALOG_DEFAULTS.brandType}
          />
          <BaseInput
            label={COPY.logo}
            name="logo_url"
            maxLength={CATALOG_LIMITS.url}
            defaultValue={row?.logo_url ?? ""}
          />
          <BaseInput
            label={COPY.website}
            name="website"
            maxLength={CATALOG_LIMITS.url}
            defaultValue={row?.website ?? ""}
          />
        </>
      )}
      columns={[
        { id: "name", header: COPY.name, render: (row) => row.name },
        {
          id: "type",
          header: COPY.type,
          render: (row) => (row.type ? VALUE_LABELS[row.type] : COPY.empty),
        },
      ]}
    />
  );
}
