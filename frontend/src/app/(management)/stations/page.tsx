import type { Metadata } from "next";
import { StationsPage } from "@/components/features/stations/stations-page";
import { requireWebSession } from "@/lib/server/require-web-session";
import { COPY } from "@/constants/management";

export const metadata: Metadata = {
  title: COPY.stations,
  description: COPY.stationDescription,
};

export default async function Page() {
  const user = await requireWebSession();
  return <StationsPage user={user} />;
}
