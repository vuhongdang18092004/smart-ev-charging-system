"use client";

import { useRef, useState, type FormEvent } from "react";
import { BaseButton } from "@/components/base/base-button";
import { COPY } from "@/constants/management";
import type { ManagedFormProps } from "@/types/management-ui";
import { errorMessage, validationMessage } from "@/utils/form-errors";
import { ZodError } from "zod";

export function ManagedForm({
  children,
  submit,
  onSuccess,
  submitLabel,
  secondarySubmit,
  disabled,
}: ManagedFormProps) {
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const submitter =
      event.nativeEvent instanceof SubmitEvent
        ? event.nativeEvent.submitter
        : null;
    const form = new FormData(event.currentTarget, submitter);
    submitting.current = true;
    setBusy(true);
    setError(undefined);
    try {
      await submit(form);
      onSuccess();
    } catch (cause) {
      setError(
        cause instanceof ZodError
          ? validationMessage(cause)
          : errorMessage(cause),
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <fieldset disabled={busy || disabled} className="grid min-w-0 gap-4">
        {children}
      </fieldset>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <BaseButton
          disabled={busy || disabled}
          type="submit"
          className="bg-brand! text-white!"
        >
          {busy ? COPY.saving : submitLabel}
        </BaseButton>
        {secondarySubmit && (
          <BaseButton
            disabled={busy || disabled}
            type="submit"
            name={secondarySubmit.name}
            value={secondarySubmit.value}
          >
            {secondarySubmit.label}
          </BaseButton>
        )}
      </div>
    </form>
  );
}
