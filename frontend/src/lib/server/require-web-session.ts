import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { WEB_AUTH_ROUTES, WEB_ROLE } from "@/constants/web-auth";
import { currentWebUser, webCookies } from "./web-session";

const checkedUser = cache(async () => {
  const { access, refresh } = await webCookies();
  if (access) {
    const result = await currentWebUser(access);
    if (result.user) return result.user;
    if (result.status !== 401 && result.status !== 403) {
      throw new Error("Management authentication unavailable");
    }
    if (result.status === 403) redirect(WEB_AUTH_ROUTES.login);
  }
  redirect(refresh ? WEB_AUTH_ROUTES.renew : WEB_AUTH_ROUTES.login);
});

export async function requireWebSession(adminOnly = false) {
  const user = await checkedUser();
  if (adminOnly && user.role !== WEB_ROLE.admin)
    redirect(WEB_AUTH_ROUTES.stations);
  return user;
}
