"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { COPY, ROUTES } from "@/constants/management";
import { WEB_AUTH_COPY, WEB_AUTH_ROUTES, WEB_ROLE } from "@/constants/web-auth";
import { webAuth } from "@/services/web-auth-service";
import type { ManagementShellProps } from "@/types/web-auth";

const navigation = [
  { href: ROUTES.stations, label: COPY.stations },
  { href: ROUTES.brands, label: COPY.brands },
  { href: ROUTES.connectorTypes, label: COPY.connectorTypes },
  { href: ROUTES.operators, label: COPY.operators },
];

export function ManagementShell({ children, user }: ManagementShellProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const pathname = usePathname();
  const links =
    user.role === WEB_ROLE.admin
      ? navigation
      : navigation.filter((item) => item.href === ROUTES.stations);

  async function signOut() {
    setSigningOut(true);
    setSignOutError(false);
    try {
      await webAuth("logout");
      window.location.replace(WEB_AUTH_ROUTES.login);
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }

  return (
    <div className="management-workspace min-h-screen bg-workspace text-ink md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="flex flex-col bg-sidebar px-5 py-6 text-white md:sticky md:top-0 md:h-screen">
        <div className="mb-7 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand"
          >
            <span className="h-5 w-2 -skew-x-12 rounded-sm bg-white" />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">{COPY.app}</p>
            <p className="text-xs text-slate-300">{COPY.subtitle}</p>
          </div>
        </div>
        <nav
          aria-label={COPY.overview}
          className="grid grid-cols-2 gap-1.5 md:grid-cols-1"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`rounded-lg px-3 py-2.5 text-sm focus-visible:outline-2 ${pathname === href ? "bg-white/15 font-semibold text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <BaseButton
          className="mt-6 self-start bg-white/10! text-white! md:mt-auto"
          onClick={() => void signOut()}
          disabled={signingOut}
        >
          {COPY.signOut}
        </BaseButton>
        {signOutError && (
          <p role="alert" className="mt-2 text-sm">
            {WEB_AUTH_COPY.signOutFailed}
          </p>
        )}
      </aside>
      <main className="min-w-0">
        <div className="border-b border-line bg-white px-5 py-4 text-sm font-medium text-slate-600 lg:px-9">
          {COPY.workspace} · {user.name}
        </div>
        <div className="mx-auto max-w-7xl px-5 py-7 lg:px-9 lg:py-9">
          {children}
        </div>
      </main>
    </div>
  );
}
