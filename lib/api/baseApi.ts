import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import { RootState } from "../store";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.dandelionz.com.ng";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, api) => {
    const args = (api as any).arg;
    const token = (api.getState() as RootState).auth.accessToken;

    if (token && args?.url !== "/auth/token/refresh/") {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("X-Platform", "mobile");

    const { body } = args || {};
    if (body instanceof FormData) {
      // let browser set Content-Type for FormData
    } else {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

export const mutex = {
  isLocked: false,
  /**
   * Every caller currently parked in `wait()`.
   *
   * This has to be a list. Holding a single resolver meant each new waiter
   * overwrote the previous one, so `unlock()` woke only the most recent caller
   * and every earlier request hung forever — its promise never settled, leaving
   * the query stuck loading with no error. Concurrent waiters are the norm
   * here: a token refresh fires while several screens' queries are in flight.
   */
  waiters: [] as (() => void)[],
  wait: function () {
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve);
    });
  },
  lock: function () {
    this.isLocked = true;
  },
  unlock: function () {
    this.isLocked = false;
    // Swap before draining so a waiter that re-parks doesn't get dropped.
    const waiting = this.waiters;
    this.waiters = [];
    waiting.forEach((resolve) => resolve());
  },
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (mutex.isLocked) {
    await mutex.wait();
  }
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked) {
      mutex.lock();
      const state = api.getState() as RootState;
      const refreshToken = state.auth.refreshToken;

      if (refreshToken) {
        try {
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
            const { access_token, refresh_token: new_refresh_token } = (
              refreshResult.data as any
            ).data;

            api.dispatch({
              type: "auth/setTokens",
              payload: {
                accessToken: access_token,
                refreshToken: new_refresh_token,
              },
            });

            await SecureStore.setItemAsync("access_token", access_token);
            result = await baseQuery(args, api, extraOptions);
          } else {
            // Refresh endpoint returned an error — the session is truly expired.
            // Only dispatch logout if the user was authenticated to begin with.
            if (state.auth.isAuthenticated) {
              api.dispatch({ type: "auth/logout" });
            }
          }
        } catch (e) {
          if (state.auth.isAuthenticated) {
            api.dispatch({ type: "auth/logout" });
          }
        } finally {
          mutex.unlock();
        }
      } else {
        // No refresh token.
        //
        // CRITICAL FIX: Only dispatch auth/logout when the user is actually
        // authenticated. If isAuthenticated is already false (unauthenticated
        // user hitting a 401 on a public-ish endpoint), dispatching logout is
        // a no-op for Redux state values BUT Immer still creates a new state
        // reference (it ran the reducer). This new reference triggers
        // useAppSelector re-renders in frozen layout components like
        // (admin)/_layout.tsx and vendor/_layout.tsx, whose useEffects check
        // !isAuthenticated and call router.replace("/(auth)/login") —
        // redirecting the user to login even when they're just browsing
        // unauthenticated (e.g. viewing a product page).
        if (state.auth.isAuthenticated) {
          api.dispatch({ type: "auth/logout" });
        }
        // If not authenticated, simply let the 401 error propagate to the
        // calling query. The screen can handle it (show "not found", etc.)
        // without any navigation side-effect.
        mutex.unlock();
      }
    } else {
      await mutex.wait();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "User",
    "Admin",
    "Vendor",
    "Customer",
    "CustomerWallet",
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
    "CustomerPaymentSettings",
    "Refunds",
  ],
  endpoints: () => ({}),
});

export const { reducerPath, reducer, middleware } = baseApi;
