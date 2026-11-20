import type { Metadata } from "next";
import { StationsPage } from "@/components/features/stations/stations-page";
import { COPY } from "@/constants/management";

export const metadata: Metadata = {
  title: COPY.stations,
  description: COPY.stationDescription,
};

export default function Page() {
  return <StationsPage />;
}
