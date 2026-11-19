"use client";

import { useId } from "react";
import type { BaseInputProps } from "@/types/base-components";

export function BaseInput({
  label,
  error,
  id,
  className = "",
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: BaseInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="grid gap-1">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : invalid}
        aria-describedby={
          error ? [describedBy, errorId].filter(Boolean).join(" ") : describedBy
        }
        className={`rounded-md border border-current/30 bg-background px-3 py-2 ${className}`}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
