import { ManagementShell } from "@/components/features/management/management-shell";
import type { WorkspaceProps } from "@/types/management-ui";

export default function ManagementLayout({ children }: WorkspaceProps) {
  return <ManagementShell>{children}</ManagementShell>;
}
