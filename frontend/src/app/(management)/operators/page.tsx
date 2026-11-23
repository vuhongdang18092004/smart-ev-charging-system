import { OperatorsPage } from "@/components/features/operators/operators-page";
import { requireWebSession } from "@/lib/server/require-web-session";

export default async function Page() {
  await requireWebSession(true);
  return <OperatorsPage />;
}
