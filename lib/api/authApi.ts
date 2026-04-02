import { baseApi } from "./baseApi";

interface RegisterRequest {
  email: string;
  password: string;
  phone_number: string;
  full_name: string;
  role: "CUSTOMER" | "VENDOR";
  referral_code?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      uuid: string;
      email: string;
      full_name: string;
      phone_number: string;
      profile_picture: string | null;
      role: string;
      is_verified: boolean;
      is_active: boolean;
      created_at: string;
      referral_code: string;
    };
    tokens: {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      refresh_expires_in: number;
      user_uuid: string;
      issued_at: number;
    };
    is_new_user?: boolean;
    verification_needed?: boolean;
  };
}

interface RefreshTokenRequest {
  refresh_token: string;
}

interface PasswordResetRequest {
  email: string;
}

interface ConfirmPasswordResetRequest {
  uid: string;
  token: string;
  new_password: string;
}

interface VerifyEmailRequest {
  uid: string;
  token: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register/",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login/",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Refresh Token
    refreshToken: builder.mutation<
      AuthResponse["data"]["tokens"],
      RefreshTokenRequest
    >({
      query: (body) => ({
        url: "/auth/token/refresh/",
        method: "POST",
        body,
      }),
    }),

    // Password Reset
    forgotPassword: builder.mutation<
      { success: boolean; message: string },
      PasswordResetRequest
    >({
      query: (body) => ({
        url: "/auth/password-reset/",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { success: boolean; message: string },
      ConfirmPasswordResetRequest
    >({
      query: (body) => ({
        url: "/auth/password-reset/confirm/",
        method: "POST",
        body,
      }),
    }),

    requestPasswordReset: builder.mutation<
      { success: boolean; message: string },
      PasswordResetRequest
    >({
      query: (body) => ({
        url: "/auth/password-reset/",
        method: "POST",
        body,
      }),
    }),

    confirmPasswordReset: builder.mutation<
      { success: boolean; message: string },
      ConfirmPasswordResetRequest
    >({
      query: (body) => ({
        url: "/auth/password-reset/confirm/",
        method: "POST",
        body,
      }),
    }),

    // Check Verification Status
    checkVerification: builder.query<
      { success: boolean; data: { is_verified: boolean } },
      void
    >({
      query: () => "/auth/check-verification/",
      providesTags: ["Auth"],
    }),

    // Send Verification Email
    sendVerificationEmail: builder.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (body) => ({
        url: "/auth/send-verification-email/",
        method: "POST",
        body,
      }),
    }),

    // Verify Email
    verifyEmail: builder.mutation<
      { success: boolean; message: string },
      VerifyEmailRequest
    >({
      query: (body) => ({
        url: "/auth/email-verify/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Validate Token
    validateToken: builder.query<
      { success: boolean; data: { user: any } },
      void
    >({
      query: () => "/auth/token/validate/",
      providesTags: ["Auth"],
    }),

    // Logout
    logout: builder.mutation<
      { success: boolean; message: string },
      { refresh_token: string }
    >({
      query: (body) => ({
        url: "/auth/logout/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User", "Admin", "Vendor", "Customer", "Cart", "Wishlist"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useCheckVerificationQuery,
  useSendVerificationEmailMutation,
  useVerifyEmailMutation,
  useValidateTokenQuery,
  useLogoutMutation,
} = authApi;
