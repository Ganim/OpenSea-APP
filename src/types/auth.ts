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
  role: 'USER' | 'MANAGER' | 'ADMIN';
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt: Date | null;
  deletedAt?: Date | null;
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
  oldPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  profile: Profile;
}

export interface UserResponse {
  user: User;
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  sessionId: string;
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
  role?: 'USER' | 'MANAGER' | 'ADMIN';
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

export interface UpdateUserRoleRequest {
  role: 'USER' | 'MANAGER' | 'ADMIN';
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
