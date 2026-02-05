export interface JwtPayload {
  sub?: string;
  sessionId?: string;
  tenantId?: string;
  isSuperAdmin?: boolean;
  exp?: number;
  iat?: number;
}

export function decodeJWT(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwt(token: string): boolean {
  return token.split('.').length === 3;
}
