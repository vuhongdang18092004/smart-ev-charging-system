"use client";

import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import {
  BLOG_COPY,
  BLOG_LIMITS,
  BLOG_STATUS,
  BLOG_STATUS_LABELS,
} from "@/constants/blog";
import { COPY } from "@/constants/management";
import { blogPostSchema } from "@/schemas/blog";
import { saveBlogPost } from "@/services/blog-service";
import type { BlogFormProps, BlogStatus } from "@/types/blog";
import { ManagedForm } from "../management/managed-form";

function statusChoices(admin: boolean, current?: BlogStatus): BlogStatus[] {
  if (!current)
    return [
      BLOG_STATUS.draft,
      admin ? BLOG_STATUS.published : BLOG_STATUS.pending,
    ];
  if (!admin) return [current];
  switch (current) {
    case BLOG_STATUS.draft:
      return [current, BLOG_STATUS.published, BLOG_STATUS.archived];
    case BLOG_STATUS.archived:
      return [current, BLOG_STATUS.draft, BLOG_STATUS.published];
    default:
      return [current, BLOG_STATUS.archived];
  }
}

export function BlogForm({ admin, post, onSuccess }: BlogFormProps) {
  const statuses = statusChoices(admin, post?.status);
  return (
    <ManagedForm
      submitLabel={post ? COPY.save : COPY.create}
      submit={(form) =>
        saveBlogPost(blogPostSchema.parse(Object.fromEntries(form)), post?.id)
      }
      onSuccess={onSuccess}
    >
      <BaseInput
        name="title"
        label={BLOG_COPY.heading}
        defaultValue={post?.title}
        maxLength={BLOG_LIMITS.title}
        required
      />
      <BaseInput
        name="summary"
        label={BLOG_COPY.summary}
        defaultValue={post?.summary ?? ""}
        maxLength={BLOG_LIMITS.summary}
      />
      <BaseInput
        name="thumbnail_url"
        label={BLOG_COPY.thumbnail}
        type="url"
        defaultValue={post?.thumbnail_url ?? ""}
        maxLength={BLOG_LIMITS.thumbnail}
      />
      <label className="grid gap-1 text-sm font-medium">
        {BLOG_COPY.content}
        <textarea
          name="content"
          required
          defaultValue={post?.content ?? ""}
          className="min-h-64 rounded-md border border-current/30 bg-background px-3 py-2 font-normal"
        />
      </label>
      {statuses.length > 1 && (
        <BaseSelect
          name="status"
          label={COPY.status}
          defaultValue={post?.status ?? BLOG_STATUS.draft}
          options={statuses.map((value) => ({
            value,
            label: BLOG_STATUS_LABELS[value],
          }))}
        />
      )}
    </ManagedForm>
  );
}
