"use client";

import { useCallback, useState, type FormEvent } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseInput } from "@/components/base/base-input";
import { BaseModal } from "@/components/base/base-modal";
import { BasePagination } from "@/components/base/base-pagination";
import { BaseSelect } from "@/components/base/base-select";
import { BaseTable } from "@/components/base/base-table";
import {
  COPY,
  STATION_PAGE_SIZE,
  STATION_STATUSES,
  VALUE_LABELS,
} from "@/constants/management";
import {
  LOCATION_TYPES,
  PARKING_FEE_TYPES,
  STATION_MEDIA_COPY,
} from "@/constants/station-media";
import { useResource } from "@/hooks/use-resource";
import { WEB_ROLE } from "@/constants/web-auth";
import type { WebUser } from "@/types/web-auth";
import { getBrands } from "@/services/brand-service";
import { getConnectorTypes } from "@/services/connector-type-service";
import { getOperators } from "@/services/operator-service";
import { getStations } from "@/services/station-service";
import type { Station, StationFilters } from "@/types/management";
import { namedOptions, valueOptions } from "@/utils/management-options";
import { formatStationRating } from "@/utils/station-media";
import { ResourceFeedback } from "../management/resource-feedback";
import { SectionHeading } from "../management/section-heading";
import { StationDetails } from "./station-details";
import { StationForm } from "./station-form";

const initialFilters: StationFilters = {
  keyword: "",
  brandId: "",
  operatorId: "",
  status: "",
  locationType: "",
  parkingFeeType: "",
  page: 0,
  size: STATION_PAGE_SIZE,
};
const allOption = { value: "", label: COPY.all };

export function StationsPage({ user }: { user: WebUser }) {
  const [filters, setFilters] = useState(initialFilters);
  const [selected, setSelected] = useState<string>();
  const [creating, setCreating] = useState(false);
  const brands = useResource(getBrands);
  const operators = useResource(getOperators);
  const types = useResource(getConnectorTypes);
  const loadStations = useCallback(
    (signal: AbortSignal) => getStations(filters, signal),
    [filters],
  );
  const stations = useResource(loadStations);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFilters({
      ...initialFilters,
      keyword: String(form.get("keyword") ?? ""),
      brandId: String(form.get("brandId") ?? ""),
      operatorId: String(form.get("operatorId") ?? ""),
      status: String(form.get("status") ?? ""),
      locationType: String(form.get("locationType") ?? ""),
      parkingFeeType: String(form.get("parkingFeeType") ?? ""),
    });
  }

  const brandItems = brands.data ?? [];
  const admin = user.role === WEB_ROLE.admin;
  const operatorItems = admin
    ? (operators.data ?? [])
    : (operators.data ?? []).filter((operator) => operator.id === user.id);
  const connectorTypes = types.data ?? [];
  const ready =
    Boolean(brandItems.length && operatorItems.length) && Boolean(types.data);

  return (
    <div className="grid gap-6">
      <SectionHeading
        title={COPY.stations}
        description={COPY.stationDescription}
        action={COPY.addStation}
        disabled={!ready}
        onAction={() => setCreating(true)}
      />
      <div className="grid gap-2">
        {brands.error !== undefined && <ResourceFeedback {...brands} />}
        {operators.error !== undefined && <ResourceFeedback {...operators} />}
        {types.error !== undefined && <ResourceFeedback {...types} />}
        {brands.data &&
          operators.data &&
          (!brandItems.length || !operatorItems.length) && (
            <p className="rounded-xl border border-line bg-white p-3 text-sm text-slate-600">
              {COPY.noReference}
            </p>
          )}
      </div>
      <section className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <form
          onSubmit={applyFilters}
          onReset={() => setFilters(initialFilters)}
          className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <BaseInput
            label={COPY.search}
            name="keyword"
            type="search"
            maxLength={200}
          />
          <BaseSelect
            label={COPY.brand}
            name="brandId"
            options={[allOption, ...namedOptions(brandItems)]}
          />
          <BaseSelect
            label={COPY.operator}
            name="operatorId"
            options={[allOption, ...namedOptions(operatorItems)]}
          />
          <BaseSelect
            label={COPY.status}
            name="status"
            options={[allOption, ...valueOptions(STATION_STATUSES)]}
          />
          <BaseSelect
            label={STATION_MEDIA_COPY.locationType}
            name="locationType"
            options={[
              allOption,
              ...LOCATION_TYPES.map((value) => ({
                value,
                label: STATION_MEDIA_COPY.location[value],
              })),
            ]}
          />
          <BaseSelect
            label={STATION_MEDIA_COPY.parkingFeeType}
            name="parkingFeeType"
            options={[
              allOption,
              ...PARKING_FEE_TYPES.map((value) => ({
                value,
                label: STATION_MEDIA_COPY.parking[value],
              })),
            ]}
          />
          <div className="flex gap-2">
            <BaseButton type="submit" className="bg-brand! text-white!">
              {COPY.apply}
            </BaseButton>
            <BaseButton type="reset">{COPY.reset}</BaseButton>
          </div>
        </form>
        <ResourceFeedback {...stations} />
        {stations.data && (
          <div className="grid gap-4">
            <p className="text-sm text-slate-600">
              {COPY.total(stations.data.total_elements)}
            </p>
            <BaseTable<Station>
              caption={COPY.stations}
              rows={stations.data.content}
              getRowKey={(row) => row.id}
              columns={[
                {
                  id: "station",
                  header: COPY.station,
                  render: (row) => (
                    <div className="min-w-36">
                      <p className="font-semibold">{row.name}</p>
                      <p className="text-slate-600">{row.address}</p>
                    </div>
                  ),
                },
                {
                  id: "brand",
                  header: COPY.brand,
                  render: (row) =>
                    brandItems.find((brand) => brand.id === row.brand_id)
                      ?.name ?? COPY.empty,
                },
                {
                  id: "operator",
                  header: COPY.operator,
                  render: (row) =>
                    operatorItems.find(
                      (operator) => operator.id === row.operator_id,
                    )?.name ?? COPY.empty,
                },
                {
                  id: "status",
                  header: COPY.status,
                  render: (row) => (
                    <span className="inline-flex rounded-full bg-workspace px-2.5 py-1 font-medium">
                      {row.status ? VALUE_LABELS[row.status] : COPY.empty}
                    </span>
                  ),
                },
                {
                  id: "location-type",
                  header: STATION_MEDIA_COPY.locationType,
                  render: (row) => (
                    <span className="inline-flex rounded-full bg-workspace px-2 py-1 text-xs font-medium">
                      {STATION_MEDIA_COPY.location[row.location_type] ??
                        COPY.empty}
                    </span>
                  ),
                },
                {
                  id: "parking-fee",
                  header: STATION_MEDIA_COPY.parkingFeeType,
                  render: (row) =>
                    STATION_MEDIA_COPY.parking[row.parking_fee_type] ??
                    COPY.empty,
                },
                {
                  id: "rating",
                  header: STATION_MEDIA_COPY.rating,
                  render: (row) =>
                    formatStationRating(row.avg_rating, row.rating_count),
                },
                {
                  id: "actions",
                  header: COPY.actions,
                  render: (row) => (
                    <BaseButton onClick={() => setSelected(row.id)}>
                      {COPY.view}
                    </BaseButton>
                  ),
                },
              ]}
            />
            <BasePagination
              page={stations.data.page + 1}
              pageCount={stations.data.total_pages}
              onPageChange={(page) =>
                setFilters((current) => ({ ...current, page: page - 1 }))
              }
            />
          </div>
        )}
      </section>
      {creating && (
        <BaseModal
          open
          wide
          title={COPY.addStation}
          onClose={() => setCreating(false)}
        >
          <StationForm
            operatorLocked={!admin}
            brands={brandItems}
            operators={operatorItems}
            types={connectorTypes}
            onSuccess={() => {
              setCreating(false);
              stations.refresh();
            }}
          />
        </BaseModal>
      )}
      {selected && (
        <StationDetails
          canManageFeedback={admin}
          id={selected}
          brands={brandItems}
          operators={operatorItems}
          types={connectorTypes}
          onClose={() => setSelected(undefined)}
          onChange={stations.refresh}
          onDelete={() => {
            setSelected(undefined);
            if (filters.page > 0 && (stations.data?.content.length ?? 0) <= 1) {
              setFilters((current) => ({ ...current, page: current.page - 1 }));
            } else stations.refresh();
          }}
        />
      )}
    </div>
  );
}
