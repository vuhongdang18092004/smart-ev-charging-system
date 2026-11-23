"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api-error";
import { WEB_AUTH_COPY, WEB_AUTH_ROUTES } from "@/constants/web-auth";
import { COPY } from "@/constants/management";
import { refreshWebSession } from "@/services/web-auth-service";

export function WebSessionRenew() {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void refreshWebSession().then(
      () => {
        if (active) window.location.replace(WEB_AUTH_ROUTES.stations);
      },
      (error: unknown) => {
        if (!active) return;
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          window.location.replace(WEB_AUTH_ROUTES.login);
        } else setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="management-workspace grid min-h-screen place-items-center bg-workspace p-4 text-ink">
      <section className="grid max-w-md gap-3 rounded-2xl border border-line bg-white p-6">
        <p role={failed ? "alert" : "status"}>
          {failed ? WEB_AUTH_COPY.renewFailed : WEB_AUTH_COPY.renewing}
        </p>
        {failed && (
          <Link className="text-brand underline" href={WEB_AUTH_ROUTES.login}>
            {COPY.signIn}
          </Link>
        )}
      </section>
    </main>
  );
}
