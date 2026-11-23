import { BrandsPage } from "@/components/features/brands/brands-page";
import { requireWebSession } from "@/lib/server/require-web-session";

export default async function Page() {
  await requireWebSession(true);
  return <BrandsPage />;
}
