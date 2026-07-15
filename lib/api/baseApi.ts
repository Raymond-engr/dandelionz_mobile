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
    "Refunds",
  ],
  endpoints: () => ({}),
});

export const { reducerPath, reducer, middleware } = baseApi;
