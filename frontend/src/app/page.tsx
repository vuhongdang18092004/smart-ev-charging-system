import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/management";

export default function Page() {
  redirect(ROUTES.stations);
}
