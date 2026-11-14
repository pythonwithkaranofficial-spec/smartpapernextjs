/**
 * Client-safe super-admin helpers (no DB imports).
 *
 * NOTE: An email match alone is only used for UI hints on the client. On the server,
 * super-admin privileges additionally require a Firebase-verified email
 * (see `isTrustedSuperAdmin`), so registering one of these addresses without
 * proving ownership grants nothing.
 */
export const SUPER_ADMIN_EMAILS = [
  'tpaofficial1999@gmail.com',
  'officialworldwithtechnology@gmail.com',
  'pythonwithkaran.official@gmail.com',
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/** Server-side check: super-admin email AND verified by Firebase. */
export function isTrustedSuperAdmin(email?: string | null, emailVerified?: boolean | number | null): boolean {
  return Boolean(emailVerified) && isSuperAdminEmail(email);
}
