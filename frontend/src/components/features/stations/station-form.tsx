"use client";

import { useRef, useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import {
  COORDINATE_DECIMALS,
  COPY,
  STATION_ACCESS,
  STATION_DEFAULTS,
  STATION_STATUSES,
  TIME_MAX_LENGTH,
  TIME_PLACEHOLDER,
} from "@/constants/management";
import { createStationSchema, stationSchema } from "@/schemas/management";
import { createStation, updateStation } from "@/services/station-service";
import type { StationFormProps } from "@/types/management-ui";
import { namedOptions, valueOptions } from "@/utils/management-options";
import { ConnectorFields } from "../connectors/connector-fields";
import { ManagedForm } from "../management/managed-form";

const connectorPrefix = (row: number) => `connector-${row}-`;
const formatCoordinate = (value?: number) =>
  value?.toFixed(COORDINATE_DECIMALS).replace(/\.?0+$/, "") ?? "";

export function StationForm({
  station,
  brands,
  operators,
  types,
  onSuccess,
}: StationFormProps) {
  const [rows, setRows] = useState<number[]>([]);
  const nextRow = useRef(0);

  return (
    <ManagedForm
      onSuccess={onSuccess}
      submitLabel={station ? COPY.save : COPY.create}
      submit={async (form) => {
        const fields = Object.fromEntries(form);
        if (station) {
          await updateStation(station.id, stationSchema.parse(fields));
          return;
        }
        const connectors = rows.map((row) => {
          const prefix = connectorPrefix(row);
          return Object.fromEntries(
            Object.entries(fields)
              .filter(([key]) => key.startsWith(prefix))
              .map(([key, value]) => [key.slice(prefix.length), value]),
          );
        });
        await createStation(
          createStationSchema.parse({ station: fields, connectors }),
        );
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <BaseInput
          label={COPY.station}
          name="name"
          required
          maxLength={200}
          defaultValue={station?.name}
        />
        <BaseInput
          label={COPY.address}
          name="address"
          required
          maxLength={500}
          defaultValue={station?.address}
        />
        <BaseSelect
          label={COPY.brand}
          name="brand_id"
          required
          defaultValue={station?.brand_id ?? ""}
          options={[{ value: "", label: COPY.select }, ...namedOptions(brands)]}
        />
        <BaseSelect
          label={COPY.operator}
          name="operator_id"
          required
          defaultValue={station?.operator_id ?? ""}
          options={[
            { value: "", label: COPY.select },
            ...namedOptions(operators),
          ]}
        />
        <BaseInput
          label={COPY.lat}
          name="lat"
          required
          inputMode="decimal"
          defaultValue={formatCoordinate(station?.lat)}
        />
        <BaseInput
          label={COPY.lng}
          name="lng"
          required
          inputMode="decimal"
          defaultValue={formatCoordinate(station?.lng)}
        />
        <BaseSelect
          label={COPY.status}
          name="status"
          options={valueOptions(STATION_STATUSES)}
          defaultValue={station?.status ?? STATION_DEFAULTS.status}
        />
        <BaseSelect
          label={COPY.access}
          name="access_type"
          options={valueOptions(STATION_ACCESS)}
          defaultValue={station?.access_type ?? STATION_DEFAULTS.access}
        />
        <BaseInput
          label={COPY.opening}
          name="opening_time"
          placeholder={TIME_PLACEHOLDER}
          maxLength={TIME_MAX_LENGTH}
          defaultValue={station?.opening_time ?? ""}
        />
        <BaseInput
          label={COPY.closing}
          name="closing_time"
          placeholder={TIME_PLACEHOLDER}
          maxLength={TIME_MAX_LENGTH}
          defaultValue={station?.closing_time ?? ""}
        />
        <BaseInput
          label={COPY.source}
          name="source_url"
          maxLength={500}
          defaultValue={station?.source_url ?? ""}
        />
        <label className="flex items-end gap-2 self-center text-sm">
          <input
            name="is_24_7"
            type="checkbox"
            defaultChecked={station?.is_24_7 ?? false}
          />
          {COPY.allDay}
        </label>
      </div>
      {!station && (
        <section className="grid gap-3 border-t border-line pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{COPY.connectors}</h3>
            <BaseButton
              disabled={!types.length}
              onClick={() => {
                const row = nextRow.current++;
                setRows((current) => [...current, row]);
              }}
            >
              {COPY.addConnector}
            </BaseButton>
          </div>
          {rows.map((row, index) => (
            <div
              key={row}
              className="grid gap-3 rounded-xl border border-line p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium">
                  {COPY.connectorNumber(index + 1)}
                </h4>
                <BaseButton
                  onClick={() =>
                    setRows((current) => current.filter((item) => item !== row))
                  }
                >
                  {COPY.removeRow}
                </BaseButton>
              </div>
              <ConnectorFields types={types} prefix={connectorPrefix(row)} />
            </div>
          ))}
        </section>
      )}
    </ManagedForm>
  );
}
