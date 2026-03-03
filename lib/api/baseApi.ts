import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { RootState } from "../store";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.dandelionz.com.ng";

// Base query with auth token injection
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, api) => {
    const args = (api as any).arg;
    const token = (api.getState() as RootState).auth.accessToken;
    
    // Skip Authorization header for refresh token requests to avoid 401s from the refresh endpoint itself
    if (token && args?.url !== "/auth/token/refresh/") {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Access the body from the arguments passed to the query
    const { body } = args || {};

    if (body instanceof FormData) {
      // let browser set Content-Type for FormData
    } else {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

// A simple mutex to ensure we only refresh the token once.
const mutex = {
  isLocked: false,
  resolveQueue: () => {},
  wait: function () {
    return new Promise<void>((resolve) => {
      this.resolveQueue = resolve;
    });
  },
  lock: function () {
    this.isLocked = true;
  },
  unlock: function () {
    this.isLocked = false;
    this.resolveQueue();
  },
};

// Base query with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available
  if (mutex.isLocked) {
    await mutex.wait();
  }
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Check if the mutex is locked again, in case another request refreshed the token while we were waiting
    if (!mutex.isLocked) {
      mutex.lock();
      const state = api.getState() as RootState;
      const refreshToken = state.auth.refreshToken;

      if (refreshToken) {
        try {
          // Try to refresh token
          const refreshResult = await baseQuery(
            {
              url: "/auth/token/refresh/",
              method: "POST",
              body: { refresh_token: refreshToken },
            },
            api,
            extraOptions,
          );

          if (refreshResult.data) {
            const { access_token, refresh_token: new_refresh_token } = (refreshResult.data as any)
              .data;

            // Update tokens in state
            api.dispatch({
              type: "auth/setTokens",
              payload: {
                accessToken: access_token,
                refreshToken: new_refresh_token,
              },
            });

            // Update cookies so middleware doesn't reject the next navigation
            // Set max-age to 1 day (86400 seconds) or match server response if possible
            document.cookie = `access_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;

            // Retry the original query with the new token
            result = await baseQuery(args, api, extraOptions);
          } else {
            // Refresh failed - logout user
            api.dispatch({ type: "auth/logout" });
          }
        } catch (e) {
          api.dispatch({ type: "auth/logout" });
        } finally {
          mutex.unlock();
        }
      } else {
        // No refresh token - logout user and unlock
        api.dispatch({ type: "auth/logout" });
        mutex.unlock();
      }
    } else {
      // Mutex was locked, so refresh was in-progress. Await it, then retry the request.
      await mutex.wait();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

// Base API slice
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "User",
    "Admin",
    "Vendor",
    "Customer",
    "Product",
    "Order",
    "Category",
    "Cart",
    "Wishlist",
    "Payment",
    "Settlement",
    "Notification",
    "Analytics",
    "Draft",
    "Wallet",
    "AdminPaymentSettings",
  ],
  endpoints: () => ({}),
});

// Export hooks
export const { reducerPath, reducer, middleware } = baseApi;
