import { VehicleInfoPage } from "@/components/features/vehicle-info/vehicle-info-page";
import { requireWebSession } from "@/lib/server/require-web-session";

export default async function Page() {
  return <VehicleInfoPage user={await requireWebSession()} />;
}
