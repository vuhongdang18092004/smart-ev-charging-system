import { z } from "zod";
import { BLOG_COPY, BLOG_LIMITS, BLOG_STATUS } from "@/constants/blog";

const status = z.enum(BLOG_STATUS);
const optional = (value: unknown) =>
  typeof value === "string" ? value.trim() || undefined : value;

export const blogPostSchema = z.object({
  title: z.string().trim().min(1, BLOG_COPY.required).max(BLOG_LIMITS.title),
  summary: z.preprocess(
    optional,
    z.string().max(BLOG_LIMITS.summary).optional(),
  ),
  content: z
    .string()
    .refine((value) => value.trim().length > 0, BLOG_COPY.required),
  thumbnail_url: z.preprocess(
    optional,
    z
      .string()
      .max(BLOG_LIMITS.thumbnail)
      .pipe(z.url({ protocol: /^https?$/, error: BLOG_COPY.invalidUrl }))
      .optional(),
  ),
  status: z.preprocess(optional, status.optional()),
});

export const blogRejectSchema = z.object({
  rejection_reason: z.string().trim().min(1, BLOG_COPY.required),
});

export const blogFiltersSchema = z.object({
  keyword: z.preprocess(optional, z.string().optional()),
  status: z.preprocess(optional, status.optional()),
  authorId: z.preprocess(optional, z.uuid().optional()),
});
