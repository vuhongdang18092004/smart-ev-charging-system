import { BasePagination } from "@/components/base/base-pagination";
import type { FeedbackCollectionProps } from "@/types/management-ui";
import { ResourceFeedback } from "../management/resource-feedback";

export function FeedbackCollection<T extends { id: string }>({
  data,
  error,
  loading,
  refresh,
  setPage,
  emptyLabel,
  renderItem,
}: FeedbackCollectionProps<T>) {
  if (!data)
    return (
      <ResourceFeedback error={error} loading={loading} refresh={refresh} />
    );

  return (
    <>
      {data.content.length ? (
        <ul className="grid gap-3">
          {data.content.map((item) => (
            <li
              key={item.id}
              className="min-w-0 rounded-xl border border-line p-3"
            >
              {renderItem(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">{emptyLabel}</p>
      )}
      <BasePagination
        page={data.page + 1}
        pageCount={data.total_pages}
        onPageChange={(page) => setPage(page - 1)}
      />
    </>
  );
}
