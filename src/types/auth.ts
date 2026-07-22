export type UserRole = 'USER' | 'ADMIN';
export type UserPlan = 'FREE' | 'PRO' | 'PREMIUM' | 'ENTERPRISE';

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  plan: UserPlan;
}

export interface AuthSession {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}
