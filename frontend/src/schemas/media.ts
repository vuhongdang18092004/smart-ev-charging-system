import { z } from "zod";
import { COPY } from "@/constants/management";
import {
  DEFAULT_MEDIA_SORT,
  HTTP_MEDIA_URL_PATTERN,
  MEDIA_LIMITS,
  STATION_MEDIA_COPY,
} from "@/constants/station-media";

export const mediaUrlSchema = z
  .string({ error: COPY.required })
  .trim()
  .min(1, COPY.required)
  .max(MEDIA_LIMITS.url, COPY.invalid)
  .regex(HTTP_MEDIA_URL_PATTERN, STATION_MEDIA_COPY.invalidUrl)
  .pipe(z.url({ protocol: /^https?$/, error: STATION_MEDIA_COPY.invalidUrl }));

export const optionalMediaUrlSchema = z.preprocess(
  (value) =>
    value === null || (typeof value === "string" && value.trim() === "")
      ? undefined
      : value,
  mediaUrlSchema.optional(),
);

export const mediaSortSchema = z.preprocess(
  (value) => (value === "" || value == null ? String(DEFAULT_MEDIA_SORT) : value),
  z
    .string({ error: COPY.required })
    .trim()
    .regex(/^-?\d+$/, COPY.invalid)
    .transform(Number)
    .pipe(z.int32({ error: COPY.invalid })),
);
