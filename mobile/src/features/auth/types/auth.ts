export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  role: 'driver';
  email_verified: true;
}

export interface DriverSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: DriverProfile;
}

export interface LoginFields { email: string; password: string }
export interface RegistrationFields extends LoginFields { name: string }
export interface VerificationFields { email: string; otp: string }
export interface ResetFields extends VerificationFields { password: string }

export type ChallengeKind = 'verify' | 'reset';
export interface PendingChallenge {
  kind: ChallengeKind;
  email: string;
  sentAt: number;
}
