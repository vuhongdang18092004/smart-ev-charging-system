"use client";

import { useEffect, useId, useRef } from "react";
import { UI_LABELS } from "@/constants/ui-labels";
import type { BaseModalProps } from "@/types/base-components";
import { BaseButton } from "./base-button";

export function BaseModal({
  open,
  title,
  children,
  onClose,
  wide,
}: BaseModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`m-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-xl bg-background p-6 text-foreground shadow-lg backdrop:bg-black/50 ${wide ? "max-w-4xl" : "max-w-lg"}`}
    >
      <header className="mb-4 flex items-center justify-between gap-4">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <BaseButton onClick={onClose}>{UI_LABELS.close}</BaseButton>
      </header>
      {children}
    </dialog>
  );
}
