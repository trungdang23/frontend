import { env } from '@/app/config/env';
import { ApiError } from '@/shared/api/api-error';
import { ApiResponse, ApiSuccess } from '@/shared/api/api-types';

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

async function requestRaw<TResponse, TMeta = undefined, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<ApiSuccess<TResponse, TMeta>> {
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
      return requestRaw<TResponse, TMeta, TBody>(path, {
        ...options,
        retryOnUnauthorized: false,
      });
    }

    clientConfig.onUnauthorized();
  }

  const responseText = await response.text();
  const payload = responseText ? (JSON.parse(responseText) as ApiResponse<TResponse, TMeta>) : null;

  if (payload?.success === false) {
    throw new ApiError({
      code: payload.error.code,
      details: payload.error.details,
      message: payload.error.message,
      status: response.status,
    });
  }

  if (!response.ok) {
    throw new ApiError({
      message: 'Request failed.',
      status: response.status,
    });
  }

  if (payload?.success === true) {
    return payload;
  }

  return {
    success: true,
    data: undefined as TResponse,
  };
}

export async function request<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const payload = await requestRaw<TResponse, undefined, TBody>(path, options);

  return payload.data;
}

export async function requestWithMeta<TResponse, TMeta = undefined, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<ApiSuccess<TResponse, TMeta>> {
  return requestRaw<TResponse, TMeta, TBody>(path, options);
}
