"use client";

import { useId } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import { COPY } from "@/constants/management";
import {
  DEFAULT_MEDIA_SORT,
  DEFAULT_MEDIA_TYPE,
  DEFAULT_REPORT_ISSUE,
  MEDIA_LIMITS,
  MEDIA_TYPES,
  REPORT_ISSUES,
  REVIEW_RATINGS,
  STATION_MEDIA_COPY,
} from "@/constants/station-media";
import { useDynamicRows } from "@/hooks/use-dynamic-rows";
import {
  createReviewSchema,
  stationReportSchema,
} from "@/schemas/station-feedback";
import { createReview } from "@/services/review-service";
import { createStationReport } from "@/services/station-report-service";
import type { StationFeedbackFormProps } from "@/types/management-ui";
import { readPrefixedFields } from "@/utils/dynamic-fields";
import { namedOptions } from "@/utils/management-options";
import { ManagedForm } from "../management/managed-form";

const mediaPrefix = (key: number) => `media-${key}-`;

export function StationFeedbackForm({
  stationId,
  kind,
  types,
  onSuccess,
}: StationFeedbackFormProps) {
  const mediaRows = useDynamicRows<undefined>([]);
  const hintId = useId();
  const noteId = useId();
  const isReview = kind === "review";
  const commentLabel = isReview
    ? STATION_MEDIA_COPY.comment
    : STATION_MEDIA_COPY.note;

  return (
    <ManagedForm
      onSuccess={onSuccess}
      submitLabel={
        isReview
          ? STATION_MEDIA_COPY.createReview
          : STATION_MEDIA_COPY.createReport
      }
      submit={(form) => {
        const fields = {
          ...Object.fromEntries(form),
          media: mediaRows.rows.map(({ key }) =>
            readPrefixedFields(form, mediaPrefix(key)),
          ),
        };
        return isReview
          ? createReview(stationId, createReviewSchema.parse(fields))
          : createStationReport(stationId, stationReportSchema.parse(fields));
      }}
    >
      <div className="grid gap-1">
        <BaseInput
          label={STATION_MEDIA_COPY.driverId}
          name="driver_id"
          required
          aria-describedby={hintId}
        />
        <p id={hintId} className="text-sm text-slate-600">
          {STATION_MEDIA_COPY.driverHint}
        </p>
      </div>
      {isReview ? (
        <BaseSelect
          label={STATION_MEDIA_COPY.rating}
          name="rating"
          defaultValue=""
          options={[
            { value: "", label: COPY.select },
            ...REVIEW_RATINGS.map((rating) => ({
              value: String(rating),
              label: STATION_MEDIA_COPY.stars(rating),
            })),
          ]}
          required
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <BaseSelect
            label={STATION_MEDIA_COPY.issueType}
            name="issue_type"
            defaultValue={DEFAULT_REPORT_ISSUE}
            options={REPORT_ISSUES.map((value) => ({
              value,
              label: STATION_MEDIA_COPY.issueLabels[value],
            }))}
          />
          <BaseSelect
            label={COPY.connectorType}
            name="connector_type_id"
            options={[
              { value: "", label: STATION_MEDIA_COPY.allConnectors },
              ...namedOptions(types),
            ]}
          />
        </div>
      )}
      <div className="grid gap-1">
        <label htmlFor={noteId} className="text-sm font-medium">
          {commentLabel}
        </label>
        <textarea
          id={noteId}
          name={isReview ? "comment" : "note"}
          rows={3}
          className="w-full rounded-lg border border-current/30 bg-background p-2 text-sm"
        />
      </div>
      <section className="grid gap-3 border-t border-line pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-semibold">{STATION_MEDIA_COPY.media}</h4>
          <BaseButton onClick={() => mediaRows.add(undefined)}>
            {STATION_MEDIA_COPY.addMedia}
          </BaseButton>
        </div>
        {mediaRows.rows.length > 0 && (
          <p className="text-sm text-slate-600">{STATION_MEDIA_COPY.urlHint}</p>
        )}
        {mediaRows.rows.map(({ key }, index) => (
          <div
            key={key}
            className="grid gap-3 rounded-lg border border-line p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h5 className="text-sm font-medium">
                {STATION_MEDIA_COPY.mediaNumber(index + 1)}
              </h5>
              <BaseButton onClick={() => mediaRows.remove(key)}>
                {COPY.removeRow}
              </BaseButton>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <BaseSelect
                label={STATION_MEDIA_COPY.mediaType}
                name={mediaPrefix(key) + "media_type"}
                defaultValue={DEFAULT_MEDIA_TYPE}
                options={MEDIA_TYPES.map((value) => ({
                  value,
                  label: STATION_MEDIA_COPY.mediaLabels[value],
                }))}
              />
              <BaseInput
                label={COPY.sortOrder}
                name={mediaPrefix(key) + "sort_order"}
                inputMode="numeric"
                defaultValue={DEFAULT_MEDIA_SORT}
              />
              <BaseInput
                label={STATION_MEDIA_COPY.url}
                name={mediaPrefix(key) + "url"}
                type="url"
                required
                maxLength={MEDIA_LIMITS.url}
              />
              <BaseInput
                label={STATION_MEDIA_COPY.thumbnail}
                name={mediaPrefix(key) + "thumbnail_url"}
                type="url"
                maxLength={MEDIA_LIMITS.url}
              />
            </div>
          </div>
        ))}
      </section>
    </ManagedForm>
  );
}
