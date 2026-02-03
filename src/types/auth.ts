// User Types
export interface Profile {
  id: string;
  userId: string;
  name: string;
  surname: string;
  birthday?: Date;
  location: string;
  bio: string;
  avatarUrl: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date | null;
  lastLoginAt: Date | null;
  deletedAt?: Date | null;
  forcePasswordReset?: boolean;
  forcePasswordResetReason?: string | null;
  forcePasswordResetRequestedAt?: Date | null;
  isSuperAdmin: boolean;
  profile?: Profile | null;
}

// Auth Requests
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
  profile?: {
    name?: string;
    surname?: string;
    birthday?: Date;
    location?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export interface SendPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Force Password Reset
export interface ForcePasswordResetRequest {
  reason?: string;
  sendEmail?: boolean;
}

export interface PasswordResetRequiredResponse {
  message: string;
  code: string; // 'PASSWORD_RESET_REQUIRED'
  resetToken: string;
  reason?: string;
  requestedAt?: Date;
}

export interface ForcePasswordResetResponse {
  user: User & {
    forcePasswordReset?: boolean;
    forcePasswordResetReason?: string | null;
    forcePasswordResetRequestedAt?: Date | null;
  };
  message: string;
}

// Auth Responses
export interface AuthResponse {
  user: User;
  sessionId: string;
  token: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface BlockedResponse {
  message: string;
  blockedUntil: Date;
}

// Me (Profile) Types
export interface UpdateProfileRequest {
  name?: string;
  surname?: string;
  birthday?: Date;
  location?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateEmailRequest {
  email: string;
}

export interface UpdateUsernameRequest {
  username: string;
}

export interface UpdatePasswordRequest {
  /** Nova senha (backend não requer senha antiga atualmente) */
  password: string;
}

export interface ProfileResponse {
  profile: Profile;
}

export interface UserResponse {
  user: User;
}

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

// Users Admin Types
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserEmailRequest {
  email: string;
}

export interface UpdateUserUsernameRequest {
  username: string;
}

export interface UpdateUserPasswordRequest {
  newPassword: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  surname?: string;
  birthday?: Date;
  location?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UsersResponse {
  users: User[];
}

// Auth State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  module: string;
  entityId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ip: string;
  userAgent: string;
  endpoint: string;
  method: string;
  description: string;
  createdAt: Date;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogsQuery {
  action?: string;
  entity?: string;
  module?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Permission Types
export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  module: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: Permission[];
}

export interface PermissionsResponse {
  permissions: Permission[];
}

export interface GroupsResponse {
  groups: PermissionGroup[];
}
