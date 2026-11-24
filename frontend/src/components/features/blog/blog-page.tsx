"use client";

import { useCallback, useState, type FormEvent } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseInput } from "@/components/base/base-input";
import { BaseModal } from "@/components/base/base-modal";
import { BasePagination } from "@/components/base/base-pagination";
import { BaseSelect } from "@/components/base/base-select";
import { BaseTable } from "@/components/base/base-table";
import { BLOG_COPY, BLOG_STATUS_LABELS } from "@/constants/blog";
import { COPY } from "@/constants/management";
import { WEB_ROLE } from "@/constants/web-auth";
import { useResource } from "@/hooks/use-resource";
import { blogFiltersSchema } from "@/schemas/blog";
import { getBlogPosts } from "@/services/blog-service";
import type { BlogFilters, BlogPageProps, BlogPost } from "@/types/blog";
import { ResourceFeedback } from "../management/resource-feedback";
import { SectionHeading } from "../management/section-heading";
import { BlogDetails } from "./blog-details";
import { BlogForm } from "./blog-form";

const statuses = Object.entries(BLOG_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const date = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

export function BlogPage({ user }: BlogPageProps) {
  const admin = user.role === WEB_ROLE.admin;
  const [filters, setFilters] = useState<BlogFilters>({});
  const [filterError, setFilterError] = useState<string>();
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const load = useCallback(
    (signal: AbortSignal) => getBlogPosts(filters, page, signal),
    [filters, page],
  );
  const resource = useResource(load);
  const rows = resource.data;
  const refresh = resource.refresh;

  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = blogFiltersSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    setFilterError(
      parsed.success ? undefined : parsed.error.issues[0]?.message,
    );
    if (!parsed.success) return;
    setFilters(parsed.data);
    setPage(0);
  }

  return (
    <div className="grid gap-6">
      <SectionHeading
        title={BLOG_COPY.title}
        description={admin ? BLOG_COPY.description : BLOG_COPY.ownDescription}
        action={BLOG_COPY.create}
        onAction={() => setCreating(true)}
      />
      <section className="grid gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <form
          onSubmit={filter}
          className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          <BaseInput name="keyword" label={BLOG_COPY.search} />
          <BaseSelect
            name="status"
            label={COPY.status}
            options={[{ value: "", label: BLOG_COPY.allStatuses }, ...statuses]}
          />
          {admin && <BaseInput name="authorId" label={BLOG_COPY.author} />}
          <BaseButton type="submit" className="justify-self-start">
            {BLOG_COPY.filter}
          </BaseButton>
          {filterError && (
            <p role="alert" className="text-sm text-red-700 md:col-span-2">
              {filterError}
            </p>
          )}
        </form>
        <ResourceFeedback {...resource} />
        {rows && (
          <>
            {!rows.content.length ? (
              <p className="text-sm">{BLOG_COPY.empty}</p>
            ) : (
              <BaseTable<BlogPost>
                caption={BLOG_COPY.title}
                rows={rows.content}
                getRowKey={(row) => row.id}
                columns={[
                  {
                    id: "title",
                    header: BLOG_COPY.heading,
                    render: (row) => row.title,
                  },
                  {
                    id: "status",
                    header: COPY.status,
                    render: (row) => (
                      <span className="inline-block rounded-full border border-line px-2 py-1 text-xs font-medium">
                        {BLOG_STATUS_LABELS[row.status]}
                      </span>
                    ),
                  },
                  {
                    id: "updated",
                    header: BLOG_COPY.updatedAt,
                    render: (row) => date.format(new Date(row.updated_at)),
                  },
                  {
                    id: "actions",
                    header: COPY.actions,
                    render: (row) => (
                      <BaseButton onClick={() => setSelectedId(row.id)}>
                        {BLOG_COPY.detail}
                      </BaseButton>
                    ),
                  },
                ]}
              />
            )}
            <BasePagination
              page={page + 1}
              pageCount={rows.total_pages}
              onPageChange={(next) => setPage(next - 1)}
            />
          </>
        )}
      </section>
      {creating && (
        <BaseModal
          open
          wide
          title={BLOG_COPY.create}
          onClose={() => setCreating(false)}
        >
          <BlogForm
            admin={admin}
            onSuccess={() => {
              setCreating(false);
              setPage(0);
              refresh();
            }}
          />
        </BaseModal>
      )}
      {selectedId && (
        <BlogDetails
          key={selectedId}
          id={selectedId}
          user={user}
          onSave={() => {
            setPage(0);
            refresh();
          }}
          onClose={() => setSelectedId(undefined)}
          onDelete={() => {
            setSelectedId(undefined);
            if (page > 0 && rows?.content.length === 1) setPage(page - 1);
            refresh();
          }}
        />
      )}
    </div>
  );
}
