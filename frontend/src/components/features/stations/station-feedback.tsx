"use client";

import { useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseModal } from "@/components/base/base-modal";
import { COPY } from "@/constants/management";
import { STATION_MEDIA_COPY } from "@/constants/station-media";
import { useStationFeedback } from "@/hooks/use-station-feedback";
import { getReviews } from "@/services/review-service";
import { getStationReports } from "@/services/station-report-service";
import type {
  StationFeedbackKind,
  StationFeedbackProps,
} from "@/types/management-ui";
import { formatFeedbackDate } from "@/utils/station-media";
import { FeedbackCollection } from "./feedback-collection";
import { FeedbackMedia } from "./feedback-media";
import { StationFeedbackForm } from "./station-feedback-form";

export function StationFeedback({
  stationId,
  types,
  onReviewSubmitted,
}: StationFeedbackProps) {
  const reviews = useStationFeedback(stationId, getReviews);
  const reports = useStationFeedback(stationId, getStationReports);
  const [editing, setEditing] = useState<StationFeedbackKind>();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="grid min-w-0 content-start gap-3 rounded-xl border border-line p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{STATION_MEDIA_COPY.reviews}</h3>
          <BaseButton onClick={() => setEditing("review")}>
            {STATION_MEDIA_COPY.createReview}
          </BaseButton>
        </div>
        <FeedbackCollection
          {...reviews}
          emptyLabel={STATION_MEDIA_COPY.noReviews}
          renderItem={(review) => (
            <article className="grid gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {STATION_MEDIA_COPY.stars(review.rating)}
                </p>
                <span className="text-xs text-slate-600">
                  {formatFeedbackDate(review.created_at)}
                </span>
              </div>
              <p className="break-all text-xs text-slate-600">
                {STATION_MEDIA_COPY.driver(review.driver_id)}
              </p>
              {review.comment && (
                <p className="break-words whitespace-pre-wrap text-sm">
                  {review.comment}
                </p>
              )}
              <FeedbackMedia media={review.media} />
            </article>
          )}
        />
      </section>
      <section className="grid min-w-0 content-start gap-3 rounded-xl border border-line p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{STATION_MEDIA_COPY.reports}</h3>
          <BaseButton onClick={() => setEditing("report")}>
            {STATION_MEDIA_COPY.createReport}
          </BaseButton>
        </div>
        <FeedbackCollection
          {...reports}
          emptyLabel={STATION_MEDIA_COPY.noReports}
          renderItem={(report) => (
            <article className="grid gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {STATION_MEDIA_COPY.issueLabels[report.issue_type]}
                </p>
                <span className="rounded-full bg-workspace px-2 py-1 text-xs">
                  {report.status
                    ? STATION_MEDIA_COPY.reportStatus[report.status]
                    : COPY.empty}
                </span>
              </div>
              <p className="break-all text-xs text-slate-600">
                {STATION_MEDIA_COPY.driver(report.driver_id)}
              </p>
              {report.created_at && (
                <p className="text-xs text-slate-600">
                  {formatFeedbackDate(report.created_at)}
                </p>
              )}
              {report.connector_type_id && (
                <p className="text-sm">
                  {COPY.connectorType} ·{" "}
                  {types.find((type) => type.id === report.connector_type_id)
                    ?.name ?? report.connector_type_id}
                </p>
              )}
              {report.note && (
                <p className="break-words whitespace-pre-wrap text-sm">
                  {report.note}
                </p>
              )}
              <FeedbackMedia media={report.media} />
            </article>
          )}
        />
      </section>
      {editing && (
        <BaseModal
          open
          wide
          title={
            editing === "review"
              ? STATION_MEDIA_COPY.createReview
              : STATION_MEDIA_COPY.createReport
          }
          onClose={() => setEditing(undefined)}
        >
          <StationFeedbackForm
            stationId={stationId}
            kind={editing}
            types={types}
            onSuccess={() => {
              setEditing((current) =>
                current === editing ? undefined : current,
              );
              if (editing === "review") {
                reviews.reloadFirstPage();
                onReviewSubmitted();
              } else {
                reports.reloadFirstPage();
              }
            }}
          />
        </BaseModal>
      )}
    </div>
  );
}
