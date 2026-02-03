export const externalApiConfig = {
  baseURL:
    process.env.NEXT_PUBLIC_EXTERNAL_API_BASE_URL ||
    'https://brasilapi.com.br/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
};
