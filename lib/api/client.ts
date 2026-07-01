export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type ApiRequestOptions<T> = {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  mock: () => T | Promise<T>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const mockDelay = Number(process.env.NEXT_PUBLIC_MOCK_API_DELAY ?? 250);

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export async function apiRequest<T>({ path, method = "GET", body, headers, mock }: ApiRequestOptions<T>): Promise<T> {
  if (useMockApi) {
    if (typeof window !== "undefined" && mockDelay > 0) await wait(mockDelay);
    return mock();
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) {
    let details: unknown;
    try { details = await response.json(); } catch { details = undefined; }
    throw new ApiError(`Request failed with status ${response.status}`, response.status, details);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getApiMode() {
  return useMockApi ? "mock" : "remote";
}
