"use client";

import { useCallback } from "react";
import { COPY } from "@/constants/management";
import { useResource } from "@/hooks/use-resource";
import { allowedBrandsSchema } from "@/schemas/management";
import { getBrands } from "@/services/brand-service";
import {
  getAllowedBrands,
  updateAllowedBrands,
} from "@/services/operator-service";
import type { AllowedBrandsFormProps } from "@/types/management-ui";
import { ManagedForm } from "../management/managed-form";
import { ResourceFeedback } from "../management/resource-feedback";

const brandIdsField = "brandIds";

export function AllowedBrandsForm({
  operatorId,
  onSuccess,
}: AllowedBrandsFormProps) {
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [brands, allowed] = await Promise.all([
        getBrands(signal),
        getAllowedBrands(operatorId, signal),
      ]);
      return { brands, selected: new Set(allowed.map((brand) => brand.id)) };
    },
    [operatorId],
  );
  const resource = useResource(load);

  if (!resource.data) return <ResourceFeedback {...resource} />;
  const { brands, selected } = resource.data;
  if (!brands.length)
    return <p className="text-sm text-slate-600">{COPY.noBrandsAvailable}</p>;

  return (
    <ManagedForm
      submitLabel={COPY.save}
      onSuccess={onSuccess}
      submit={(form) =>
        updateAllowedBrands(
          operatorId,
          allowedBrandsSchema.parse({ brandIds: form.getAll(brandIdsField) }),
        )
      }
    >
      <ul className="grid max-h-72 gap-2 overflow-y-auto">
        {brands.map((brand) => (
          <li key={brand.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <input
                type="checkbox"
                name={brandIdsField}
                value={brand.id}
                defaultChecked={selected.has(brand.id)}
              />
              {brand.name}
            </label>
          </li>
        ))}
      </ul>
    </ManagedForm>
  );
}
