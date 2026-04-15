import { env } from '@/app/config/env';
import { ApiError } from '@/shared/api/api-error';
import { ApiResponse } from '@/shared/api/api-types';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type RequestOptions<TBody> = {
  method?: HttpMethod;
  body?: TBody;
  auth?: boolean;
  headers?: HeadersInit;
  signal?: AbortSignal;
  retryOnUnauthorized?: boolean;
};

type HttpClientConfig = {
  getAccessToken: () => string | null;
  refreshSession: () => Promise<string | null>;
  onUnauthorized: () => void;
};

let clientConfig: HttpClientConfig = {
  getAccessToken: () => null,
  refreshSession: async () => null,
  onUnauthorized: () => undefined,
};

export function configureHttpClient(config: HttpClientConfig) {
  clientConfig = config;
}

export function resetHttpClientConfig() {
  clientConfig = {
    getAccessToken: () => null,
    refreshSession: async () => null,
    onUnauthorized: () => undefined,
  };
}

export async function request<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const method = options.method || 'GET';
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth) {
    const accessToken = clientConfig.getAccessToken();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (response.status === 401 && options.auth && options.retryOnUnauthorized !== false) {
    const nextAccessToken = await clientConfig.refreshSession();

    if (nextAccessToken) {
      return request<TResponse, TBody>(path, {
        ...options,
        retryOnUnauthorized: false,
      });
    }

    clientConfig.onUnauthorized();
  }

  const payload = (await response.json()) as ApiResponse<TResponse>;

  if (!response.ok || payload.success === false) {
    throw new ApiError({
      code: payload.success === false ? payload.error.code : 'UNKNOWN_ERROR',
      details: payload.success === false ? payload.error.details : undefined,
      message: payload.success === false ? payload.error.message : 'Request failed.',
      status: response.status,
    });
  }

  return payload.data;
}
