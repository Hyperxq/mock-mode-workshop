const API_BASE =
  import.meta.env.VITE_API_BASE ?? 'https://jsonplaceholder.typicode.com';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Minimal fetch wrapper. Centralises the base URL and content-type
 * defaults so call sites stay boring.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}
