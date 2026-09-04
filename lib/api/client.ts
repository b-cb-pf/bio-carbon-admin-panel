export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type ApiRequestOptions<T> = {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  remote?: boolean;
  authenticated?: boolean;
  mock: () => T | Promise<T>;
};

export type ApiErrorBody = {
  message?: string;
  code?: string;
  field?: string;
  errors?: Array<{ field?: string; code?: string; message?: string }>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiErrorMessage(reason: unknown, fallback: string) {
  return reason instanceof ApiError ? reason.message : fallback;
}

export function apiErrorCode(reason: unknown) {
  return reason instanceof ApiError ? reason.details?.code : undefined;
}

export function apiFieldErrors(reason: unknown) {
  if (!(reason instanceof ApiError)) return {};

  const fieldErrors: Record<string, string> = {};
  if (reason.details?.field) fieldErrors[reason.details.field] = reason.message;
  for (const error of reason.details?.errors ?? []) {
    if (error.field && error.message && !fieldErrors[error.field]) {
      fieldErrors[error.field] = error.message;
    }
  }
  return fieldErrors;
}

const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const mockDelay = Number(process.env.NEXT_PUBLIC_MOCK_API_DELAY ?? 250);

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export async function apiRequest<T>({
  path,
  method = "GET",
  body,
  headers,
  remote = false,
  authenticated = false,
  mock,
}: ApiRequestOptions<T>): Promise<T> {
  if (useMockApi && !remote) {
    if (typeof window !== "undefined" && mockDelay > 0) await wait(mockDelay);
    return mock();
  }

  let authorization: Record<string, string> = {};
  if (authenticated && typeof window !== "undefined") {
    const { getAuthSession } = await import("@/lib/auth-session");
    const session = getAuthSession();
    if (!session) {
      window.location.assign("/login?reason=session-expired");
      return new Promise<T>(() => undefined);
    }
    authorization = { Authorization: `${session.tokenType} ${session.accessToken}` };
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "omit",
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...authorization,
      ...headers,
    },
  });

  if (!response.ok) {
    let details: ApiErrorBody | undefined;
    try { details = await response.json(); } catch { details = undefined; }
    const accountInactive = response.status === 403 && details?.code === "AUTH_USER_NOT_RESOLVED";
    if ((response.status === 401 || accountInactive) && authenticated && typeof window !== "undefined") {
      const { clearAuthSession } = await import("@/lib/auth-session");
      clearAuthSession();
      window.location.assign(accountInactive ? "/login?reason=account-inactive" : "/login?reason=session-expired");
      return new Promise<T>(() => undefined);
    }
    const message = details?.message ?? details?.errors?.[0]?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, details);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getApiMode() {
  return useMockApi ? "mock" : "remote";
}
