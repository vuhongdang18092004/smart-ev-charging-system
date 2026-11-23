import { ManagementShell } from "@/components/features/management/management-shell";
import { requireWebSession } from "@/lib/server/require-web-session";
import type { WorkspaceProps } from "@/types/management-ui";

export default async function ManagementLayout({ children }: WorkspaceProps) {
  const user = await requireWebSession();
  return <ManagementShell user={user}>{children}</ManagementShell>;
}
