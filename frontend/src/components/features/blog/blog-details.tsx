"use client";

import { useCallback, useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseInput } from "@/components/base/base-input";
import { BaseModal } from "@/components/base/base-modal";
import { BLOG_COPY, BLOG_STATUS, BLOG_STATUS_LABELS } from "@/constants/blog";
import { WEB_ROLE } from "@/constants/web-auth";
import { useResource } from "@/hooks/use-resource";
import { blogRejectSchema } from "@/schemas/blog";
import {
  deleteBlogPost,
  getBlogPost,
  moderateBlogPost,
} from "@/services/blog-service";
import type { BlogAction, BlogDialogProps } from "@/types/blog";
import { ManagedForm } from "../management/managed-form";
import { ResourceFeedback } from "../management/resource-feedback";
import { BlogForm } from "./blog-form";

const confirmCopy = {
  submit: BLOG_COPY.confirmSubmit,
  approve: BLOG_COPY.confirmApprove,
  delete: BLOG_COPY.confirmDelete,
};
const dates = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function BlogDetails({
  id,
  user,
  onSave,
  onDelete,
  onClose,
}: BlogDialogProps) {
  const [action, setAction] = useState<BlogAction>();
  const load = useCallback(
    (signal: AbortSignal) => getBlogPost(id, signal),
    [id],
  );
  const resource = useResource(load);
  const post = resource.data;
  const admin = user.role === WEB_ROLE.admin;
  const editableByOperator =
    post?.author_id === user.id &&
    (post.status === BLOG_STATUS.draft || post.status === BLOG_STATUS.rejected);

  function saved() {
    setAction(undefined);
    resource.refresh();
    onSave();
  }

  return (
    <BaseModal
      open
      wide
      title={action ? BLOG_COPY[action] : BLOG_COPY.detail}
      onClose={onClose}
    >
      <ResourceFeedback {...resource} />
      {post && !action && (
        <div className="grid gap-5">
          <div>
            <p className="text-sm text-muted-foreground">
              {BLOG_STATUS_LABELS[post.status]}
            </p>
            <h3 className="mt-1 break-words text-2xl font-semibold">
              {post.title}
            </h3>
            {post.summary && <p className="mt-2 break-words">{post.summary}</p>}
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold">{BLOG_COPY.slug}</dt>
              <dd className="break-all">{post.slug}</dd>
            </div>
            {admin && (
              <div>
                <dt className="font-semibold">{BLOG_COPY.author}</dt>
                <dd className="break-all">{post.author_id}</dd>
              </div>
            )}
            {post.reviewed_by && admin && (
              <div>
                <dt className="font-semibold">{BLOG_COPY.reviewer}</dt>
                <dd className="break-all">{post.reviewed_by}</dd>
              </div>
            )}
            {post.reviewed_at && (
              <div>
                <dt className="font-semibold">{BLOG_COPY.reviewedAt}</dt>
                <dd>{dates.format(new Date(post.reviewed_at))}</dd>
              </div>
            )}
            {post.published_at && (
              <div>
                <dt className="font-semibold">{BLOG_COPY.publishedAt}</dt>
                <dd>{dates.format(new Date(post.published_at))}</dd>
              </div>
            )}
            {post.thumbnail_url && (
              <div>
                <dt className="font-semibold">{BLOG_COPY.thumbnail}</dt>
                <dd className="break-all">{post.thumbnail_url}</dd>
              </div>
            )}
          </dl>
          {post.rejection_reason && (
            <div className="rounded-md border border-line p-3">
              <p className="font-semibold">{BLOG_COPY.reason}</p>
              <p className="whitespace-pre-wrap break-words">
                {post.rejection_reason}
              </p>
            </div>
          )}
          <div className="rounded-md border border-line p-4">
            <h4 className="mb-2 font-semibold">{BLOG_COPY.content}</h4>
            <p className="whitespace-pre-wrap break-words">{post.content}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(admin || editableByOperator) && (
              <>
                <BaseButton onClick={() => setAction("edit")}>
                  {BLOG_COPY.edit}
                </BaseButton>
                <BaseButton onClick={() => setAction("delete")}>
                  {BLOG_COPY.delete}
                </BaseButton>
              </>
            )}
            {!admin && editableByOperator && (
              <BaseButton onClick={() => setAction("submit")}>
                {BLOG_COPY.submit}
              </BaseButton>
            )}
            {admin && post.status === BLOG_STATUS.pending && (
              <>
                <BaseButton onClick={() => setAction("approve")}>
                  {BLOG_COPY.approve}
                </BaseButton>
                <BaseButton onClick={() => setAction("reject")}>
                  {BLOG_COPY.reject}
                </BaseButton>
              </>
            )}
          </div>
        </div>
      )}
      {post && action && (
        <div className="grid gap-4">
          <BaseButton
            className="justify-self-start"
            onClick={() => setAction(undefined)}
          >
            {BLOG_COPY.back}
          </BaseButton>
          {action === "edit" ? (
            <BlogForm admin={admin} post={post} onSuccess={saved} />
          ) : (
            <ManagedForm
              key={action}
              submitLabel={BLOG_COPY[action]}
              onSuccess={action === "delete" ? onDelete : saved}
              submit={(form) => {
                if (action === "delete") return deleteBlogPost(id);
                if (action === "reject") {
                  const { rejection_reason } = blogRejectSchema.parse(
                    Object.fromEntries(form),
                  );
                  return moderateBlogPost(id, action, rejection_reason);
                }
                return moderateBlogPost(id, action);
              }}
            >
              {action === "reject" ? (
                <BaseInput
                  label={BLOG_COPY.reason}
                  name="rejection_reason"
                  required
                />
              ) : (
                <p>{confirmCopy[action]}</p>
              )}
            </ManagedForm>
          )}
        </div>
      )}
    </BaseModal>
  );
}
