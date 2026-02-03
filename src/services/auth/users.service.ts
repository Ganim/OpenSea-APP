import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import type {
  CreateUserRequest,
  ForcePasswordResetRequest,
  ForcePasswordResetResponse,
  MessageResponse,
  ProfileResponse,
  UpdateUserEmailRequest,
  UpdateUserPasswordRequest,
  UpdateUserProfileRequest,
  UpdateUserUsernameRequest,
  UserResponse,
  UsersResponse,
} from '@/types/auth';

export const usersService = {
  // GET /v1/users
  async listUsers(): Promise<UsersResponse> {
    return apiClient.get<UsersResponse>(API_ENDPOINTS.USERS.LIST);
  },

  // GET /v1/users/:userId
  async getUser(userId: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(API_ENDPOINTS.USERS.GET(userId));
  },

  // GET /v1/users/email/:email
  async getUserByEmail(email: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(API_ENDPOINTS.USERS.GET_BY_EMAIL(email));
  },

  // GET /v1/users/username/:username
  async getUserByUsername(username: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(
      API_ENDPOINTS.USERS.GET_BY_USERNAME(username)
    );
  },

  // GET /v1/users/online
  async getOnlineUsers(): Promise<UsersResponse> {
    return apiClient.get<UsersResponse>(API_ENDPOINTS.USERS.GET_ONLINE);
  },

  // POST /v1/users
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return apiClient.post<UserResponse>(API_ENDPOINTS.USERS.CREATE, data);
  },

  // PATCH /v1/users/:userId/email
  async updateUserEmail(
    userId: string,
    data: UpdateUserEmailRequest
  ): Promise<UserResponse> {
    return apiClient.patch<UserResponse>(
      API_ENDPOINTS.USERS.UPDATE_EMAIL(userId),
      data
    );
  },

  // PATCH /v1/users/:userId/username
  async updateUserUsername(
    userId: string,
    data: UpdateUserUsernameRequest
  ): Promise<UserResponse> {
    return apiClient.patch<UserResponse>(
      API_ENDPOINTS.USERS.UPDATE_USERNAME(userId),
      data
    );
  },

  // PATCH /v1/users/:userId/password
  async updateUserPassword(
    userId: string,
    data: UpdateUserPasswordRequest
  ): Promise<MessageResponse> {
    return apiClient.patch<MessageResponse>(
      API_ENDPOINTS.USERS.UPDATE_PASSWORD(userId),
      data
    );
  },

  // PATCH /v1/users/:userId
  async updateUserProfile(
    userId: string,
    data: UpdateUserProfileRequest
  ): Promise<ProfileResponse> {
    return apiClient.patch<ProfileResponse>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE(userId),
      data
    );
  },

  // DELETE /v1/users/:userId
  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.USERS.DELETE(userId));
  },

  // POST /v1/users/:userId/force-password-reset
  async forcePasswordReset(
    userId: string,
    data: ForcePasswordResetRequest
  ): Promise<ForcePasswordResetResponse> {
    return apiClient.post<ForcePasswordResetResponse>(
      API_ENDPOINTS.FORCE_PASSWORD_RESET.REQUEST(userId),
      data
    );
  },
};
