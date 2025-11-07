export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const authConfig = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
};
