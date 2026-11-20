"use client";

import { useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import {
  COPY,
  STATION_ACCESS,
  STATION_DEFAULTS,
  STATION_STATUSES,
  TIME_MAX_LENGTH,
  TIME_PLACEHOLDER,
} from "@/constants/management";
import {
  DEFAULT_PARKING_FEE,
  DEFAULT_STATION_LOCATION,
  LOCATION_TYPES,
  PARKING_FEE_TYPES,
  STATION_MEDIA_COPY,
} from "@/constants/station-media";
import { useDynamicRows } from "@/hooks/use-dynamic-rows";
import { createStationSchema, stationSchema } from "@/schemas/management";
import { createStation, updateStation } from "@/services/station-service";
import type { StationFormProps } from "@/types/management-ui";
import type { StationImage } from "@/types/management";
import { readPrefixedFields } from "@/utils/dynamic-fields";
import { namedOptions, valueOptions } from "@/utils/management-options";
import { stationImagesChanged } from "@/utils/station-media";
import { ConnectorFields } from "../connectors/connector-fields";
import { ManagedForm } from "../management/managed-form";
import { StationImageFields } from "./station-image-fields";

const connectorPrefix = (row: number) => `connector-${row}-`;
const imagePrefix = (row: number) => `image-${row}-`;

export function StationForm({
  station,
  brands,
  operators,
  types,
  onSuccess,
}: StationFormProps) {
  const initialImages = station?.images ?? [];
  const imageRows = useDynamicRows<StationImage | undefined>(initialImages);
  const connectors = useDynamicRows<undefined>([]);
  const [primaryImage, setPrimaryImage] = useState(() =>
    initialImages.findIndex((image) => image.is_primary),
  );
  const selectedPrimary =
    imageRows.rows.find((row) => row.key === primaryImage)?.key ??
    imageRows.rows[0]?.key;

  return (
    <ManagedForm
      onSuccess={onSuccess}
      submitLabel={station ? COPY.save : COPY.create}
      submit={async (form) => {
        const images = imageRows.rows.map(({ key }) => ({
          ...readPrefixedFields(form, imagePrefix(key)),
          is_primary: selectedPrimary === key,
        }));
        const fields = { ...Object.fromEntries(form), images };
        if (station) {
          const { images: parsedImages, ...body } = stationSchema.parse(fields);
          await updateStation(station.id, {
            ...body,
            images:
              parsedImages && stationImagesChanged(initialImages, parsedImages)
                ? parsedImages
                : undefined,
          });
          return;
        }
        await createStation(
          createStationSchema.parse({
            station: fields,
            connectors: connectors.rows.map(({ key }) =>
              readPrefixedFields(form, connectorPrefix(key)),
            ),
          }),
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
          defaultValue={station?.lat}
        />
        <BaseInput
          label={COPY.lng}
          name="lng"
          required
          inputMode="decimal"
          defaultValue={station?.lng}
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
        <BaseSelect
          label={STATION_MEDIA_COPY.locationType}
          name="location_type"
          options={LOCATION_TYPES.map((value) => ({
            value,
            label: STATION_MEDIA_COPY.location[value],
          }))}
          defaultValue={station?.location_type ?? DEFAULT_STATION_LOCATION}
        />
        <BaseSelect
          label={STATION_MEDIA_COPY.parkingFeeType}
          name="parking_fee_type"
          options={PARKING_FEE_TYPES.map((value) => ({
            value,
            label: STATION_MEDIA_COPY.parking[value],
          }))}
          defaultValue={station?.parking_fee_type ?? DEFAULT_PARKING_FEE}
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
      <section className="grid gap-3 border-t border-line pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">{STATION_MEDIA_COPY.images}</h3>
            <p className="text-sm text-slate-600">
              {STATION_MEDIA_COPY.primaryHint}
            </p>
          </div>
          <BaseButton onClick={() => imageRows.add(undefined)}>
            {STATION_MEDIA_COPY.addImage}
          </BaseButton>
        </div>
        {imageRows.rows.map(({ key, value }, index) => (
          <div
            key={key}
            className="grid gap-3 rounded-xl border border-line p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium">
                {STATION_MEDIA_COPY.imageNumber(index + 1)}
              </h4>
              <BaseButton onClick={() => imageRows.remove(key)}>
                {COPY.removeRow}
              </BaseButton>
            </div>
            <StationImageFields
              image={value}
              prefix={imagePrefix(key)}
              primary={selectedPrimary === key}
              onSelectPrimary={() => setPrimaryImage(key)}
            />
          </div>
        ))}
      </section>
      {!station && (
        <section className="grid gap-3 border-t border-line pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{COPY.connectors}</h3>
            <BaseButton
              disabled={!types.length}
              onClick={() => connectors.add(undefined)}
            >
              {COPY.addConnector}
            </BaseButton>
          </div>
          {connectors.rows.map(({ key: row }, index) => (
            <div
              key={row}
              className="grid gap-3 rounded-xl border border-line p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium">
                  {COPY.connectorNumber(index + 1)}
                </h4>
                <BaseButton onClick={() => connectors.remove(row)}>
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
