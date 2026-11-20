import {
  HTTP_MEDIA_URL_PATTERN,
  STATION_MEDIA_COPY,
} from "@/constants/station-media";
import type { StationImage, StationImageRequest } from "@/types/management";

const scoreFormat = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});
const countFormat = new Intl.NumberFormat("vi-VN");
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

export function formatStationRating(score: number, count: number) {
  return count
    ? STATION_MEDIA_COPY.ratingSummary(
        scoreFormat.format(score),
        countFormat.format(count),
      )
    : STATION_MEDIA_COPY.unrated;
}

export function formatFeedbackDate(value: string | null) {
  return value ? dateFormat.format(new Date(value)) : null;
}

export function safeMediaUrl(value: string | null | undefined) {
  if (!value || !HTTP_MEDIA_URL_PATTERN.test(value)) return undefined;
  return URL.canParse(value) ? value : undefined;
}

export function stationImagesChanged(
  original: readonly StationImage[],
  next: readonly StationImageRequest[],
) {
  return (
    original.length !== next.length ||
    next.some((image, index) => {
      const saved = original[index];
      return (
        image.url !== saved.url ||
        (image.caption ?? null) !== saved.caption ||
        image.is_primary !== saved.is_primary ||
        image.sort_order !== saved.sort_order
      );
    })
  );
}
