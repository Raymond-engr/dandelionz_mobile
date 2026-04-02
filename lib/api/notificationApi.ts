import { baseApi } from "./baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerPushToken: builder.mutation<
      { success: boolean; message: string },
      { token: string; platform: string }
    >({
      query: (body) => ({
        url: "/user/notifications/register-token/",
        method: "POST",
        body,
      }),
    }),
    
    unregisterPushToken: builder.mutation<
      { success: boolean; message: string },
      { token: string }
    >({
      query: (body) => ({
        url: "/user/notifications/unregister-token/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterPushTokenMutation,
  useUnregisterPushTokenMutation,
} = notificationApi;
