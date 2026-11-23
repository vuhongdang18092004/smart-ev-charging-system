export type WebRole = "admin" | "operator";

export interface WebUser {
  id: string;
  name: string;
  email: string;
  role: WebRole;
  email_verified: true;
}

export interface WebSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: WebUser;
}

export type WebAuthAction =
  | "login"
  | "verify-email"
  | "resend-otp"
  | "forgot-password"
  | "reset-password"
  | "refresh"
  | "logout";

export interface WebLoginForm {
  email: string;
  password: string;
}

export interface WebVerificationForm {
  email: string;
  otp: string;
}

export interface WebResetForm extends WebVerificationForm {
  password: string;
}

export interface ManagementShellProps {
  children: React.ReactNode;
  user: WebUser;
}
