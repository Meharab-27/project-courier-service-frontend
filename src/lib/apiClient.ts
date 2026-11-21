import {
  type FetchOptions,
  type FetchRequest,
  type MappedResponseType,
  type ResponseType,
  ofetch,
} from "ofetch";
const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // In local development pointing to localhost, use the local env directly
  if (
    envUrl &&
    (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))
  ) {
    return envUrl.replace(/\/+$/, "");
  }

  // In the browser on deployed environments (e.g. Vercel), route through the same-origin
  // `/api/v1` proxy configured in next.config.ts rewrites.
  // This prevents 404s when environment variables are omitted on Vercel,
  // and eliminates CORS errors when the backend only whitelists localhost origins.
  if (typeof window !== "undefined") {
    return "/api/v1";
  }

  // On server-side (RSC / SSR / build prerender), use the absolute backend URL
  if (envUrl) {
    let clean = envUrl.trim().replace(/\/+$/, "");
    if (!clean.endsWith("/api/v1") && !clean.includes("/api/")) {
      clean = `${clean}/api/v1`;
    }
    return clean;
  }

  return "https://project-courier-service.vercel.app/api/v1";
};

const BASE_URL = getBaseUrl();
interface RetryOptions<R extends ResponseType = "json"> extends FetchOptions<R> {
  _isRetry?: boolean;
}

export interface IRefreshTokenResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  accessToken?: string;
}

// Low-level fetch instance that executes requests and formats errors
const rawFetch = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  async onRequest({ options }) {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const headers = new Headers(options.headers);
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        options.headers = headers;
      }
    }
  },
  async onResponseError({ response }) {
    const errorData = response._data;
    const message =
      errorData?.message ||
      errorData?.error ||
      errorData?.errorMessages?.[0]?.message ||
      response.statusText ||
      "Something went wrong";

    const error = new Error(message) as Error & {
      status?: number;
      statusCode?: number;
      response?: typeof response;
      data?: unknown;
    };
    error.status = response.status;
    error.statusCode = response.status;
    error.response = response;
    error.data = errorData;
    throw error;
  },
});

// Mutex / singleton promise to prevent multiple simultaneous refresh calls
let refreshPromise: Promise<string | null> | null = null;

async function requestRefreshToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // Call POST /api/v1/auth/refresh-token with credentials: "include" to send refresh token cookie
      const res = await rawFetch<IRefreshTokenResponse>("/auth/refresh-token", {
        method: "POST",
        credentials: "include",
        // Avoid sending an invalid bearer token in the refresh call itself
        headers: {
          "Content-Type": "application/json",
        },
      });

      const newToken = res?.data?.accessToken || res?.accessToken;

      if (newToken && typeof window !== "undefined") {
        localStorage.setItem("accessToken", newToken);
        return newToken;
      }
      return null;
    } catch (refreshErr) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      throw refreshErr;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * apiClient with automatic 401 interceptor:
 * Catches 401 Unauthorized responses, triggers POST /api/v1/auth/refresh-token,
 * stores the new token in localStorage, and seamlessly retries the original request.
 */
async function apiClient<T = any, R extends ResponseType = "json">(
  request: FetchRequest,
  options?: RetryOptions<R>,
): Promise<MappedResponseType<R, T>> {
  try {
    return await rawFetch<T, R>(request, options);
  } catch (error: unknown) {
    const err = error as {
      status?: number;
      statusCode?: number;
      message?: string;
    };
    const status = err?.status || err?.statusCode;

    const requestUrl =
      typeof request === "string"
        ? request
        : "url" in request
          ? (request.url as string)
          : "";

    const isAuthUrl =
      requestUrl.includes("/auth/refresh-token") ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    // Intercept 401 errors for non-auth requests and retry once with refreshed token
    if (
      status === 401 &&
      !options?._isRetry &&
      !isAuthUrl &&
      typeof window !== "undefined"
    ) {
      try {
        const refreshedToken = await requestRefreshToken();
        if (refreshedToken) {
          const retryOptions: RetryOptions<R> = {
            ...options,
            _isRetry: true,
          };
          const headers = new Headers(retryOptions.headers);
          headers.set("Authorization", `Bearer ${refreshedToken}`);
          retryOptions.headers = headers;

          return await rawFetch<T, R>(request, retryOptions);
        }
      } catch {
        // Refresh token failed or expired; rethrow original error so app handles unauthenticated state
        throw error;
      }
    }

    throw error;
  }
}

// Preserve ofetch helper properties on apiClient
apiClient.raw = rawFetch.raw;
apiClient.native = rawFetch.native;
apiClient.create = rawFetch.create;

export { apiClient };
export default apiClient;
