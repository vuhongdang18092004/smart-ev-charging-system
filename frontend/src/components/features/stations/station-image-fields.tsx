import { BaseInput } from "@/components/base/base-input";
import { COPY } from "@/constants/management";
import {
  DEFAULT_MEDIA_SORT,
  MEDIA_LIMITS,
  STATION_MEDIA_COPY,
  STATION_PRIMARY_IMAGE_FIELD,
} from "@/constants/station-media";
import type { StationImageFieldsProps } from "@/types/management-ui";

export function StationImageFields({
  image,
  prefix,
  primary,
  onSelectPrimary,
}: StationImageFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <BaseInput
          label={STATION_MEDIA_COPY.url}
          name={prefix + "url"}
          type="url"
          defaultValue={image?.url}
          required
          maxLength={MEDIA_LIMITS.url}
        />
      </div>
      <BaseInput
        label={STATION_MEDIA_COPY.caption}
        name={prefix + "caption"}
        maxLength={MEDIA_LIMITS.caption}
        defaultValue={image?.caption ?? ""}
      />
      <BaseInput
        label={COPY.sortOrder}
        name={prefix + "sort_order"}
        inputMode="numeric"
        defaultValue={image?.sort_order ?? DEFAULT_MEDIA_SORT}
      />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="radio"
          name={STATION_PRIMARY_IMAGE_FIELD}
          checked={primary}
          onChange={onSelectPrimary}
        />
        {STATION_MEDIA_COPY.primary}
      </label>
    </div>
  );
}
