"use client";

import { UI_LABELS } from "@/constants/ui-labels";
import type { BasePaginationProps } from "@/types/base-components";
import { BaseButton } from "./base-button";

export function BasePagination({
  page,
  pageCount,
  onPageChange,
}: BasePaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label={UI_LABELS.pagination}
      className="flex flex-wrap items-center gap-3"
    >
      <BaseButton disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        {UI_LABELS.previousPage}
      </BaseButton>
      <span aria-live="polite" className="text-sm">
        {UI_LABELS.pageOf(page, pageCount)}
      </span>
      <BaseButton
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        {UI_LABELS.nextPage}
      </BaseButton>
    </nav>
  );
}
