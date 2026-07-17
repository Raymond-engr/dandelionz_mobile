import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
