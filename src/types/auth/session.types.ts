// Session Types

// Device type classification
export type DeviceType =
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'smarttv'
  | 'wearable'
  | 'console'
  | 'embedded'
  | 'unknown';

// Login method used for authentication
export type LoginMethod =
  | 'password'
  | 'oauth'
  | 'magic_link'
  | 'api_key'
  | 'refresh';

// Device information collected from User-Agent
export interface DeviceInfo {
  userAgent?: string;
  deviceType: DeviceType;
  deviceName?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  displayName: string;
  isMobile: boolean;
  isBot: boolean;
}

// Geolocation information from IP
export interface GeoLocation {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  displayName: string;
  shortName: string;
}

// Full session with device, location and security info
export interface Session {
  id: string;
  userId: string;
  ip: string;
  createdAt: Date;
  expiredAt?: Date | null;
  revokedAt?: Date | null;
  lastUsedAt?: Date | null;

  // Device information
  device: DeviceInfo;

  // Geolocation
  location: GeoLocation;

  // Security
  isTrusted: boolean;
  trustVerifiedAt?: Date | null;
  loginMethod: LoginMethod;

  // Computed fields from backend
  isActive: boolean;
  displayDescription: string;
}

// Computed helpers for Session
export function isSessionActive(session: Session): boolean {
  // Prefer backend-computed isActive if available
  if (typeof session.isActive === 'boolean') return session.isActive;
  // Fallback to local computation
  if (session.revokedAt) return false;
  if (session.expiredAt && new Date(session.expiredAt) < new Date())
    return false;
  return true;
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Resposta do endpoint de refresh token
 * Nota: sessionId não é retornado neste endpoint (apenas em login)
 */
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface SessionDateQuery {
  startDate?: Date;
  endDate?: Date;
}
