"use client";

import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import {
  CATALOG_DEFAULTS,
  CATALOG_LIMITS,
  COPY,
  OPERATOR_ACCESS,
  OPERATOR_ACCESS_SPECIFIC,
  OPERATOR_STATUSES,
  VALUE_LABELS,
} from "@/constants/management";
import {
  inviteOperatorSchema,
  updateOperatorSchema,
} from "@/schemas/management";
import { WEB_AUTH_COPY } from "@/constants/web-auth";
import {
  inviteOperator,
  getOperators,
  updateOperator,
} from "@/services/operator-service";
import { valueOptions } from "@/utils/management-options";
import { CatalogPage } from "../management/catalog-page";
import { AllowedBrandsForm } from "./allowed-brands-form";

export function OperatorsPage() {
  return (
    <CatalogPage
      title={COPY.operators}
      description={COPY.operatorDescription}
      action={WEB_AUTH_COPY.inviteOperator}
      load={getOperators}
      create={(form) =>
        inviteOperator(inviteOperatorSchema.parse(Object.fromEntries(form)))
      }
      editTitle={COPY.editOperator}
      update={(row, form) =>
        updateOperator(
          row.id,
          updateOperatorSchema.parse(Object.fromEntries(form)),
        )
      }
      secondaryAction={{
        label: COPY.allowedBrands,
        render: (row, onSuccess) => (
          <AllowedBrandsForm operatorId={row.id} onSuccess={onSuccess} />
        ),
      }}
      fields={(row) => (
        <>
          <BaseInput
            label={COPY.name}
            name="name"
            maxLength={CATALOG_LIMITS.name}
            defaultValue={row?.name}
            required
          />
          <BaseInput
            label={COPY.email}
            name="email"
            type="email"
            maxLength={CATALOG_LIMITS.email}
            defaultValue={row?.email}
            required
          />
          {row && (
            <>
              <BaseInput
                label={COPY.password}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-describedby="operator-password-hint"
              />
              {row && (
                <p
                  id="operator-password-hint"
                  className="text-sm text-slate-600"
                >
                  {COPY.optionalPassword}
                </p>
              )}
              {row && (
                <BaseSelect
                  label={COPY.status}
                  name="status"
                  options={[
                    { value: "", label: COPY.empty },
                    ...valueOptions(OPERATOR_STATUSES),
                  ]}
                  defaultValue={row.status ?? ""}
                />
              )}
              <BaseSelect
                label={COPY.access}
                name="access_type"
                options={valueOptions(OPERATOR_ACCESS)}
                defaultValue={
                  row?.access_type ?? CATALOG_DEFAULTS.operatorAccess
                }
              />
              <BaseInput
                label={COPY.endpoint}
                name="api_endpoint"
                maxLength={CATALOG_LIMITS.url}
                defaultValue={row?.api_endpoint ?? ""}
              />
            </>
          )}
        </>
      )}
      columns={[
        { id: "name", header: COPY.name, render: (row) => row.name },
        { id: "email", header: COPY.email, render: (row) => row.email },
        {
          id: "status",
          header: COPY.status,
          render: (row) => (row.status ? VALUE_LABELS[row.status] : COPY.empty),
        },
        {
          id: "allowed-brands",
          header: COPY.allowedBrands,
          render: (row) =>
            row.access_type !== OPERATOR_ACCESS_SPECIFIC ? (
              <span className="rounded-full bg-workspace px-2 py-1">
                {VALUE_LABELS[row.access_type]}
              </span>
            ) : row.allowedBrands.length ? (
              <ul className="flex flex-wrap gap-1">
                {row.allowedBrands.map((brand) => (
                  <li
                    key={brand.id}
                    className="rounded-full bg-workspace px-2 py-1"
                  >
                    {brand.name}
                  </li>
                ))}
              </ul>
            ) : (
              COPY.noAllowedBrands
            ),
        },
      ]}
    />
  );
}
