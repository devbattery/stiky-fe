import { cookies } from 'next/headers';
import { getApiBaseUrl } from './utils';

type NextFetchRequestConfig = {
  revalidate?: number;
  tags?: string[];
};

export class ApiError extends Error {
  status: number;
  data?: unknown;
  url: string;

  constructor(response: Response, data?: unknown) {
    const message =
      typeof data === 'object' && data && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : `API request failed with status ${response.status}`;
    super(message);
    this.name = 'ApiError';
    this.status = response.status;
    this.data = data;
    this.url = response.url;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const isServer = typeof window === 'undefined';

export type ApiFetchOptions = {
  authenticated?: boolean;
  revalidate?: number;
  tags?: string[];
  next?: NextFetchRequestConfig;
};

export type ApiInit = RequestInit & { next?: NextFetchRequestConfig };

function buildUrl(path: string): string {
  if (/^https?:/i.test(path)) {
    return path;
  }
  const base = getApiBaseUrl();
  if (!path.startsWith('/')) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
}

export async function apiFetch<T>(path: string, init: ApiInit = {}, options: ApiFetchOptions = {}): Promise<T> {
  const { authenticated = true, revalidate, tags, next } = options;
  const url = buildUrl(path);
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');

  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  if (isServer && authenticated) {
    const cookieStore = cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join('; ');
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }
  }

  const requestInit: ApiInit = {
    ...init,
    headers,
    credentials: 'include',
    cache:
      init.cache ?? (typeof revalidate === 'number' ? 'force-cache' : isServer ? 'no-store' : 'no-store'),
    next: next ?? init.next,
  };

  if (typeof revalidate === 'number' || tags?.length) {
    requestInit.next = {
      ...requestInit.next,
      revalidate,
      tags,
    };
  }

  const response = await fetch(url, requestInit);
  if (!response.ok) {
    let data: unknown;
    try {
      data = await parseResponse(response);
    } catch (error) {
      data = undefined;
    }
    throw new ApiError(response, data);
  }

  return parseResponse<T>(response);
}

function jsonBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }
  return JSON.stringify(body);
}

export async function apiGet<T>(path: string, init?: ApiInit, options?: ApiFetchOptions): Promise<T> {
  return apiFetch<T>(path, { ...init, method: init?.method ?? 'GET' }, options);
}

export async function apiPost<T>(path: string, body?: unknown, init?: ApiInit, options?: ApiFetchOptions): Promise<T> {
  const fetchInit: ApiInit = {
    ...init,
    method: 'POST',
    body: init?.body ?? jsonBody(body),
  };
  return apiFetch<T>(path, fetchInit, options);
}

export async function apiPatch<T>(path: string, body?: unknown, init?: ApiInit, options?: ApiFetchOptions): Promise<T> {
  const fetchInit: ApiInit = {
    ...init,
    method: 'PATCH',
    body: init?.body ?? jsonBody(body),
  };
  return apiFetch<T>(path, fetchInit, options);
}

export async function apiDelete<T>(path: string, init?: ApiInit, options?: ApiFetchOptions): Promise<T> {
  const fetchInit: ApiInit = {
    ...init,
    method: 'DELETE',
  };
  return apiFetch<T>(path, fetchInit, options);
}
