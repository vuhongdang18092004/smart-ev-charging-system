import { COPY, FIELD_LABELS } from "@/constants/management";
import { UI_LABELS } from "@/constants/ui-labels";
import { STATION_MEDIA_COPY } from "@/constants/station-media";
import { CONNECTOR_PORT_COPY } from "@/constants/connector-ports";
import { WEB_AUTH_COPY } from "@/constants/web-auth";
import { ApiError } from "@/lib/api-error";
import type { ZodError } from "zod";

const attachmentFields: Readonly<Record<string, string>> = {
  location_type: STATION_MEDIA_COPY.locationType,
  parking_fee_type: STATION_MEDIA_COPY.parkingFeeType,
  url: STATION_MEDIA_COPY.url,
  caption: STATION_MEDIA_COPY.caption,
  driver_id: STATION_MEDIA_COPY.driverId,
  rating: STATION_MEDIA_COPY.rating,
  issue_type: STATION_MEDIA_COPY.issueType,
  media_type: STATION_MEDIA_COPY.mediaType,
  thumbnail_url: STATION_MEDIA_COPY.thumbnail,
};
const rowLabels: Readonly<Record<string, (position: number) => string>> = {
  connectors: COPY.connectorNumber,
  images: STATION_MEDIA_COPY.imageNumber,
  media: STATION_MEDIA_COPY.mediaNumber,
};
const connectorFields: Readonly<Record<string, string>> = {
  quantity: CONNECTOR_PORT_COPY.quantity,
  code_prefix: CONNECTOR_PORT_COPY.codePrefix,
};

export function errorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return UI_LABELS.requestFailed;
  if (error.status === 401) return COPY.authFailed;
  switch (error.code) {
    case "error.invalid-otp":
      return WEB_AUTH_COPY.otpInvalid;
    case "error.account-disabled":
      return WEB_AUTH_COPY.accountDisabled;
    case "error.too-many-attempts":
      return WEB_AUTH_COPY.rateLimited;
    case "error.auth-unavailable":
      return WEB_AUTH_COPY.authUnavailable;
    default:
      return error.message || UI_LABELS.requestFailed;
  }
}

export function validationMessage(error: ZodError) {
  const issue = error.issues[0];
  if (!issue) return COPY.invalid;
  const key = String(issue.path.at(-1) ?? "");
  const field =
    attachmentFields[key] ?? connectorFields[key] ?? FIELD_LABELS[key];
  const index = issue.path.findIndex((part) => typeof part === "number");
  const rowIndex = issue.path[index];
  const row =
    typeof rowIndex === "number"
      ? rowLabels[String(issue.path[index - 1])]?.(rowIndex + 1)
      : undefined;
  const location = [row, field].filter(Boolean).join(" · ");
  return location ? COPY.invalidField(location, issue.message) : issue.message;
}
