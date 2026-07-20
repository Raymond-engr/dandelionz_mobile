import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { RECENT_SEARCHES_KEY } from "../hooks/use-recent-searches";
import { baseApi } from "./api/baseApi";
import { sentryApiErrorMiddleware } from "./api/sentryErrorMiddleware";
import authReducer from "./features/auth/authSlice";
import notificationReducer from "./features/notification/notificationSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    notification: notificationReducer,
  },
  // sentryApiErrorMiddleware must sit after baseApi.middleware so it observes
  // rejections the query middleware has already finished processing.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, sentryApiErrorMiddleware),
});

setupListeners(store.dispatch);

// Search history is stored per device, not per account, so a session ending has
// to clear it or the next person to sign in on this device sees it.
//
// This lives on the auth transition rather than in useLogout because tapping
// "Log out" is not the only way a session ends: baseApi dispatches auth/logout
// directly when a refresh fails or a 401 comes back, and expiry is the common
// case. Watching the state covers every path, including any added later.
//
// Guarded on the transition because subscribe() runs on every dispatched
// action; clearing whenever isAuthenticated is merely false would wipe a
// signed-out visitor's history continuously and it would never persist.
let wasAuthenticated = store.getState().auth.isAuthenticated;
store.subscribe(() => {
  const isAuthenticated = store.getState().auth.isAuthenticated;
  if (wasAuthenticated && !isAuthenticated) {
    AsyncStorage.removeItem(RECENT_SEARCHES_KEY).catch(() => {});
  }
  wasAuthenticated = isAuthenticated;
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
