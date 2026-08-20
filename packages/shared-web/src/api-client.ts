import type { ErrorEnvelope } from '@aiwardrobe/shared-schemas';

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

    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        signal: options.signal,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      throw {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect. Please check your internet connection.',
          correlation_id: correlationId,
        },
      } satisfies ErrorEnvelope;
    }

    if (!response.ok) {
      throw await this.parseError(response, correlationId);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
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
