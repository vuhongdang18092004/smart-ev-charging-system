import type { ComponentProps, Key, ReactNode } from "react";

export type BaseButtonProps = ComponentProps<"button">;

export interface BaseInputProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BaseSelectProps extends Omit<
  ComponentProps<"select">,
  "children"
> {
  label: string;
  options: readonly SelectOption[];
  error?: string;
}

export interface TableColumn<Row> {
  id: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
}

export interface BaseTableProps<Row> {
  caption: string;
  rows: readonly Row[];
  columns: readonly TableColumn<Row>[];
  getRowKey: (row: Row) => Key;
  emptyMessage?: string;
}

export interface BaseModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export interface BasePaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}
