import { z } from "zod";
import { COPY } from "@/constants/management";
import {
  MEDIA_TYPES,
  REPORT_ISSUES,
  REVIEW_RATINGS,
} from "@/constants/station-media";
import { mediaSortSchema, mediaUrlSchema, optionalMediaUrlSchema } from "./media";

const optional = (value: unknown) =>
  value === null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;
const note = z.preprocess(optional, z.string().trim().optional());
const driver = z.uuid({ error: COPY.invalid });
const mediaSchema = z.object({
  media_type: z.enum(MEDIA_TYPES, { error: COPY.required }),
  url: mediaUrlSchema,
  thumbnail_url: optionalMediaUrlSchema,
  sort_order: mediaSortSchema,
});

export const updateReviewSchema = z.object({
  rating: z
    .enum(REVIEW_RATINGS.map(String), { error: COPY.invalid })
    .transform(Number),
  comment: note,
  media: z.array(mediaSchema).optional(),
});
export const createReviewSchema = updateReviewSchema.extend({
  driver_id: driver,
});
export const stationReportSchema = z.object({
  driver_id: driver,
  connector_type_id: z.preprocess(
    optional,
    z.uuid({ error: COPY.invalid }).optional(),
  ),
  issue_type: z.enum(REPORT_ISSUES, { error: COPY.required }),
  note,
  media: z.array(mediaSchema).optional(),
});
