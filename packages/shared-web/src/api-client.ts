import type { ErrorEnvelope } from '@aiwardrobe/shared-schemas';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 250;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function shouldRetry(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  idempotencyKey?: string,
): boolean {
  return method === 'GET' || Boolean(idempotencyKey);
}

export type TokenProvider = () => Promise<string | undefined>;

export interface ApiRequestOptions {
  headers?: HeadersInit;
  signal?: AbortSignal;
  idempotencyKey?: string;
}

export interface ApiClientOptions {
  tokenProvider?: TokenProvider;
}

export class ApiClient {
  constructor(
    private readonly baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    private readonly options: ApiClientOptions = {},
  ) {}

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async get<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  async post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('POST', path, {
      ...options,
      body,
    });
  }

  async patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('PATCH', path, {
      ...options,
      body,
    });
  }

  async delete<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    options: ApiRequestOptions & { body?: unknown } = {},
  ): Promise<T> {
    const token = await this.options.tokenProvider?.();

    const correlationId = crypto.randomUUID();

    const headers = new Headers(options.headers);

    headers.set('Accept', 'application/json');
    headers.set('X-Correlation-Id', correlationId);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (method !== 'GET' && options.idempotencyKey) {
      headers.set('Idempotency-Key', options.idempotencyKey);
    }

    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }

    const canRetry = shouldRetry(method, options.idempotencyKey);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      let response: Response;

      try {
        response = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers,
          signal: options.signal,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
      } catch {
        if (!canRetry || attempt === MAX_RETRIES) {
          throw {
            error: {
              code: 'NETWORK_ERROR',
              message: 'Unable to connect. Please check your internet connection.',
              correlation_id: correlationId,
              retryable: canRetry,
            },
          } satisfies ErrorEnvelope;
        }

        await sleep(INITIAL_RETRY_DELAY_MS * 2 ** attempt);
        continue;
      }

      if (!response.ok) {
        const error = await this.parseError(response, correlationId);

        if (!canRetry || !error.error.retryable || attempt === MAX_RETRIES) {
          throw error;
        }

        await sleep(INITIAL_RETRY_DELAY_MS * 2 ** attempt);
        continue;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    }

    throw new Error('Request retry loop exited unexpectedly');
  }

  private async parseError(response: Response, correlationId: string): Promise<ErrorEnvelope> {
    try {
      const body = (await response.json()) as Partial<ErrorEnvelope>;

      return {
        error: {
          code: body.error?.code ?? `HTTP_${response.status}`,
          message: body.error?.message ?? (response.statusText || 'Request failed'),
          correlation_id: body.error?.correlation_id ?? correlationId,
          details: body.error?.details,
          retryable: body.error?.retryable,
        },
      };
    } catch {
      return {
        error: {
          code: `HTTP_${response.status}`,
          message: response.statusText || 'Request failed',
          correlation_id: correlationId,
        },
      };
    }
  }
}
