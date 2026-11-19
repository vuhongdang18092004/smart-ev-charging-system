import { BaseButton } from "@/components/base/base-button";
import { COPY } from "@/constants/management";
import type { ResourceFeedbackProps } from "@/types/management-ui";
import { errorMessage } from "@/utils/form-errors";

export function ResourceFeedback({
  loading,
  error,
  refresh,
}: ResourceFeedbackProps) {
  if (loading)
    return (
      <p role="status" className="py-5 text-sm text-slate-600">
        {COPY.loading}
      </p>
    );
  if (!error) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-red-50 p-3">
      <p role="alert" className="text-sm text-red-800">
        {errorMessage(error)}
      </p>
      <BaseButton onClick={refresh}>{COPY.retry}</BaseButton>
    </div>
  );
}
