"use client";

import { useId } from "react";
import type { BaseSelectProps } from "@/types/base-components";

export function BaseSelect({
  label,
  options,
  error,
  id,
  className = "",
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: BaseSelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className="grid gap-1">
      <label htmlFor={selectId} className="text-sm font-medium">
        {label}
      </label>
      <select
        {...props}
        id={selectId}
        aria-invalid={error ? true : invalid}
        aria-describedby={
          error ? [describedBy, errorId].filter(Boolean).join(" ") : describedBy
        }
        className={`rounded-md border border-current/30 bg-background px-3 py-2 ${className}`}
      >
        {options.map(({ value, label, disabled }) => (
          <option key={value} value={value} disabled={disabled}>
            {label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
