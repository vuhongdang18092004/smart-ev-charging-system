"use client";

import { useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseInput } from "@/components/base/base-input";
import { COPY } from "@/constants/management";
import {
  WEB_AUTH_COPY,
  WEB_AUTH_LIMITS,
  WEB_AUTH_ROUTES,
} from "@/constants/web-auth";
import { ApiError } from "@/lib/api-error";
import {
  webEmailSchema,
  webLoginSchema,
  webResetSchema,
  webVerifySchema,
} from "@/schemas/web-auth";
import { webAuth } from "@/services/web-auth-service";
import { ManagedForm } from "./managed-form";

type Mode =
  | "login"
  | "verify-email"
  | "resend-otp"
  | "forgot-password"
  | "reset-password";
const titles: Record<Mode, string> = {
  login: COPY.signIn,
  "verify-email": WEB_AUTH_COPY.verify,
  "resend-otp": WEB_AUTH_COPY.resend,
  "forgot-password": WEB_AUTH_COPY.forgot,
  "reset-password": WEB_AUTH_COPY.reset,
};

export function WebLoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  function choose(next: Mode) {
    setNotice("");
    setMode(next);
  }

  async function submit(form: FormData) {
    const fields = Object.fromEntries(form);
    try {
      switch (mode) {
        case "login":
          return await webAuth(mode, webLoginSchema.parse(fields));
        case "verify-email":
          return await webAuth(mode, webVerifySchema.parse(fields));
        case "reset-password":
          return await webAuth(mode, webResetSchema.parse(fields));
        default:
          return await webAuth(mode, webEmailSchema.parse(fields));
      }
    } catch (error) {
      if (
        mode === "login" &&
        error instanceof ApiError &&
        error.code === "error.email-verification-required"
      ) {
        setMode("resend-otp");
        setNotice(WEB_AUTH_COPY.verificationRequired);
      }
      throw error;
    }
  }

  function submitted() {
    if (mode === "login") {
      window.location.assign(WEB_AUTH_ROUTES.stations);
    } else if (mode === "verify-email" || mode === "reset-password") {
      setMode("login");
      setNotice(
        mode === "verify-email"
          ? WEB_AUTH_COPY.verified
          : WEB_AUTH_COPY.resetComplete,
      );
    } else {
      setMode(mode === "resend-otp" ? "verify-email" : "reset-password");
      setNotice(WEB_AUTH_COPY.codeSent);
    }
  }

  return (
    <main className="management-workspace grid min-h-screen place-items-center bg-workspace p-4 text-ink">
      <section className="grid w-full max-w-md gap-5 rounded-2xl border border-line bg-white p-6 shadow-sm">
        <header className="grid gap-2">
          <p className="font-semibold text-brand">{COPY.app}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {titles[mode]}
          </h1>
          {mode === "login" && (
            <p className="text-sm text-slate-600">{WEB_AUTH_COPY.intro}</p>
          )}
        </header>
        {notice && (
          <p role="status" className="rounded-lg bg-workspace p-3 text-sm">
            {notice}
          </p>
        )}
        <ManagedForm
          key={mode}
          submit={submit}
          onSuccess={submitted}
          submitLabel={titles[mode]}
        >
          <BaseInput
            name="email"
            label={COPY.email}
            autoComplete="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={WEB_AUTH_LIMITS.email}
            required
          />
          {(mode === "verify-email" || mode === "reset-password") && (
            <BaseInput
              name="otp"
              label={WEB_AUTH_COPY.otp}
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={WEB_AUTH_LIMITS.otp}
              required
            />
          )}
          {(mode === "login" || mode === "reset-password") && (
            <BaseInput
              name="password"
              label={
                mode === "login" ? COPY.password : WEB_AUTH_COPY.newPassword
              }
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              type="password"
              required
            />
          )}
        </ManagedForm>
        <div className="flex flex-wrap gap-2">
          {mode === "login" ? (
            <>
              <BaseButton onClick={() => choose("resend-otp")}>
                {WEB_AUTH_COPY.verify}
              </BaseButton>
              <BaseButton onClick={() => choose("forgot-password")}>
                {WEB_AUTH_COPY.forgot}
              </BaseButton>
            </>
          ) : (
            <>
              <BaseButton onClick={() => choose("login")}>
                {WEB_AUTH_COPY.returnToLogin}
              </BaseButton>
              {mode === "verify-email" && (
                <BaseButton onClick={() => choose("resend-otp")}>
                  {WEB_AUTH_COPY.resend}
                </BaseButton>
              )}
              {mode === "reset-password" && (
                <BaseButton onClick={() => choose("forgot-password")}>
                  {WEB_AUTH_COPY.resend}
                </BaseButton>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
