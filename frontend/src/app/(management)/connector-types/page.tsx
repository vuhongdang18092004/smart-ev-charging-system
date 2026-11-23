import { ConnectorTypesPage } from "@/components/features/connectors/connector-types-page";
import { requireWebSession } from "@/lib/server/require-web-session";

export default async function Page() {
  await requireWebSession(true);
  return <ConnectorTypesPage />;
}
