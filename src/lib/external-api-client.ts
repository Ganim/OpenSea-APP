import { externalApiConfig } from '@/config/external-api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ExternalApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = externalApiConfig.baseURL;
    this.timeout = externalApiConfig.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, headers, ...restOptions } = options;
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
    }

    const defaultHeaders: HeadersInit = {
      ...(restOptions.body ? externalApiConfig.headers : {}),
      ...headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        ...restOptions,
        headers: defaultHeaders,
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(
          err?.message || `HTTP error! status: ${response.status}`
        );
      }

      if (response.status === 204) return undefined as unknown as T;
      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
}

export const externalApiClient = new ExternalApiClient();
