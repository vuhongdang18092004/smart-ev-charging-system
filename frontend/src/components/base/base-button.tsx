import type { BaseButtonProps } from "@/types/base-components";

export function BaseButton({
  type = "button",
  className = "",
  ...props
}: BaseButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
