import { UI_LABELS } from "@/constants/ui-labels";
import type { BaseTableProps } from "@/types/base-components";

export function BaseTable<Row>({
  caption,
  rows,
  columns,
  getRowKey,
  emptyMessage = UI_LABELS.emptyTable,
}: BaseTableProps<Row>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-current/20">
            {columns.map((column) => (
              <th key={column.id} scope="col" className="px-3 py-2">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-center">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)} className="border-b border-current/15">
                {columns.map((column) => (
                  <td key={column.id} className="px-3 py-2">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
