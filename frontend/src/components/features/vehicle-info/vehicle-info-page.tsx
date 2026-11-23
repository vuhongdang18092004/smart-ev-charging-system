"use client";

import { useCallback, useState } from "react";
import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import { COPY } from "@/constants/management";
import { VEHICLE_INFO_COPY as text } from "@/constants/vehicle-info";
import { WEB_ROLE } from "@/constants/web-auth";
import { useResource } from "@/hooks/use-resource";
import { vehicleInfoSchema } from "@/schemas/vehicle-info";
import { getBrands } from "@/services/brand-service";
import {
  deleteVehicleInfo,
  getVehicleInfo,
  getVehicleInfoList,
  saveVehicleInfo,
} from "@/services/vehicle-info-service";
import type { WebUser } from "@/types/web-auth";
import { namedOptions } from "@/utils/management-options";
import { CatalogPage } from "../management/catalog-page";
import { ResourceFeedback } from "../management/resource-feedback";

function VehicleDetail({ id, brand }: { id: string; brand: string }) {
  const load = useCallback(
    (signal: AbortSignal) => getVehicleInfo(id, signal),
    [id],
  );
  const resource = useResource(load);
  const row = resource.data;
  return (
    <>
      <ResourceFeedback {...resource} />
      {row && (
        <dl>
          <dt>{COPY.brand}</dt>
          <dd>{brand}</dd>
          <dt>{text.model}</dt>
          <dd>{row.model}</dd>
          <dt>{text.battery}</dt>
          <dd>{row.battery_kwh}</dd>
          <dt>{text.range}</dt>
          <dd>{row.range_nedc_km}</dd>
        </dl>
      )}
    </>
  );
}

export function VehicleInfoPage({ user }: { user: WebUser }) {
  const brands = useResource(getBrands);
  const [keyword, setKeyword] = useState("");
  const [brandId, setBrandId] = useState("");
  const load = useCallback(
    (signal: AbortSignal) => getVehicleInfoList(keyword, brandId, signal),
    [keyword, brandId],
  );
  const brandOptions = namedOptions(brands.data ?? []);
  const brandName = (id: string) =>
    brands.data?.find((brand) => brand.id === id)?.name ?? COPY.empty;
  return (
    <CatalogPage
      title={text.title}
      description={text.description}
      action={text.create}
      load={load}
      editTitle={text.edit}
      toolbar={
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <BaseInput
            name="keyword"
            label={text.search}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <BaseSelect
            name="brandId"
            label={COPY.brand}
            value={brandId}
            onChange={(event) => setBrandId(event.target.value)}
            options={[{ value: "", label: text.allBrands }, ...brandOptions]}
          />
          <ResourceFeedback {...brands} />
        </div>
      }
      create={(form) =>
        saveVehicleInfo(vehicleInfoSchema.parse(Object.fromEntries(form)))
      }
      update={(row, form) =>
        saveVehicleInfo(
          vehicleInfoSchema.parse(Object.fromEntries(form)),
          row.id,
        )
      }
      remove={(row) => deleteVehicleInfo(row.id)}
      canEdit={(row) =>
        user.role === WEB_ROLE.admin || row.created_by_user_id === user.id
      }
      secondaryAction={{
        label: text.detail,
        render: (row) => (
          <VehicleDetail id={row.id} brand={brandName(row.brand_id)} />
        ),
      }}
      columns={[
        { id: "model", header: text.model, render: (row) => row.model },
        {
          id: "brand",
          header: COPY.brand,
          render: (row) => brandName(row.brand_id),
        },
        {
          id: "battery",
          header: text.battery,
          render: (row) => row.battery_kwh,
        },
        { id: "range", header: text.range, render: (row) => row.range_nedc_km },
      ]}
      fields={(row) => (
        <>
          <BaseSelect
            name="brand_id"
            label={COPY.brand}
            defaultValue={row?.brand_id ?? ""}
            required
            options={[{ value: "", label: COPY.select }, ...brandOptions]}
          />
          <BaseInput
            name="model"
            label={text.model}
            defaultValue={row?.model}
            required
            maxLength={100}
          />
          <BaseInput
            name="battery_kwh"
            label={text.battery}
            defaultValue={row?.battery_kwh}
            type="number"
            step="0.01"
            min="0.01"
            required
          />
          <BaseInput
            name="range_nedc_km"
            label={text.range}
            defaultValue={row?.range_nedc_km}
            type="number"
            min="0"
            required
          />
        </>
      )}
    />
  );
}
