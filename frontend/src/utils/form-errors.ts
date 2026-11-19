import { COPY, FIELD_LABELS } from "@/constants/management";
import { UI_LABELS } from "@/constants/ui-labels";
import { ApiError } from "@/lib/axios-client";
import type { ZodError } from "zod";

export function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 401) return COPY.authFailed;
  return error instanceof ApiError ? error.message : UI_LABELS.requestFailed;
}

export function validationMessage(error: ZodError) {
  const issue = error.issues[0];
  if (!issue) return COPY.invalid;
  const key = String(issue.path.at(-1) ?? "");
  const field = FIELD_LABELS[key];
  const row =
    issue.path[0] === "connectors" && typeof issue.path[1] === "number"
      ? COPY.connectorNumber(issue.path[1] + 1)
      : null;
  const location = [row, field].filter(Boolean).join(" · ");
  return location ? COPY.invalidField(location, issue.message) : issue.message;
}
