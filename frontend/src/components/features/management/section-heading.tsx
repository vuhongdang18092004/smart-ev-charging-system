import { BaseButton } from "@/components/base/base-button";
import type { SectionHeadingProps } from "@/types/management-ui";

export function SectionHeading({
  title,
  description,
  action,
  onAction,
  disabled,
}: SectionHeadingProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      <BaseButton
        disabled={disabled}
        onClick={onAction}
        className="bg-brand! text-white!"
      >
        {action}
      </BaseButton>
    </header>
  );
}
