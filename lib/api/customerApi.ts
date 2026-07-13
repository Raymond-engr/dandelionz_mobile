import { baseApi } from "./baseApi";

interface CustomerProfile {
  user: {
    uuid: string;
    email: string;
    full_name: string;
    phone_number: string;
    profile_picture: string | null;
    role: string;
    referral_code: string;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  shipping_address: string;
  shipping_latitude?: number;
  shipping_longitude?: number;
  city: string;
  country: string;
  postal_code: string;
  loyalty_points: number;
}

interface NotificationType {
  name: string;
  display_name: string;
  icon: string;
  color: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type?: NotificationType; // Optional
  notification_type_display?: string | null;
  notification_type_icon?: string | null;
  notification_type_color?: string | null;
  priority: string;
  category?: string;
  action_url: string | null;
  action_text: string | null;
  is_read: boolean;
  is_active?: boolean;
  is_archived?: boolean;
  created_at: string;
  sent_at?: string | null;
  read_at: string | null;
  scheduled_for?: string | null;
}

interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  last_notification_time: string | null;
}

export interface CustomerWalletBalance {
  balance: number;
  total_credits: number;
  total_debits: number;
  this_month_earnings: number;
}

export interface CustomerWalletTransaction {
  id: number;
  type: 'CREDIT' | 'DEBIT';
  amount: string;
  description: string;
  created_at: string;
}

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Wallet & Payments
    getCustomerWallet: builder.query<{ success: boolean; data: CustomerWalletBalance }, void>({
      query: () => '/user/customer/wallet/',
      providesTags: ['CustomerWallet'],
    }),

    getCustomerWalletTransactions: builder.query<
      { count: number; results: CustomerWalletTransaction[] },
      { type?: 'credit' | 'debit'; limit?: number; offset?: number }
    >({
      query: (params = {}) => ({
        url: '/user/customer/wallet/transactions/',
        params,
      }),
      providesTags: ['CustomerWallet'],
    }),

    requestCustomerWithdrawal: builder.mutation<
      { success: boolean; message: string; reference: string },
      {
        amount: number;
        pin: string;
        bank_name: string;
        account_number: string;
        account_name: string;
        bank_code: string;
      }
    >({
      query: (body) => ({
        url: '/user/customer/wallet/withdraw/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CustomerWallet'],
    }),

    setCustomerPaymentPin: builder.mutation<
      { success: boolean; message: string },
      { pin: string; confirm_pin: string }
    >({
      query: (body) => ({
        url: '/user/customer/payment-settings/pin/',
        method: 'POST',
        body,
      }),
    }),

    // Profile Management
    getCustomerProfile: builder.query<CustomerProfile, void>({
      query: () => "/user/customer/profile/",
      providesTags: ["Customer"],
    }),

    updateCustomerProfile: builder.mutation<
      CustomerProfile,
      Partial<CustomerProfile>
    >({
      query: (body) => ({
        url: "/user/customer/profile/",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),

    uploadCustomerPhoto: builder.mutation<
      { success: boolean; data: CustomerProfile },
      FormData
    >({
      query: (body) => ({
        url: "/user/customer/account/photo/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),

    partialUpdateCustomerProfile: builder.mutation<
      CustomerProfile,
      FormData
    >({
      query: (body) => ({
        url: "/user/customer/profile/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),

    changeCustomerPassword: builder.mutation<
      { success: boolean; message: string },
      { current_password: string; new_password: string }
    >({
      query: (body) => ({
        url: "/user/customer/change-password/",
        method: "POST",
        body,
      }),
    }),

    deleteCustomerAccount: builder.mutation<void, { password: string }>({
      query: (body) => ({
        url: "/user/customer/account/",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Customer", "Auth"],
    }),

    // Notifications
    getCustomerNotifications: builder.query<
      { success: boolean; data: Notification[] },
      { page?: number; page_size?: number; is_read?: boolean } | void
    >({
      query: (params) => ({
        url: "/user/notifications/",
        params: params || undefined,
      }),
      providesTags: ["Notification"],
    }),

    customerMarkNotificationAsRead: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (notification_id) => ({
        url: "/user/notifications/mark_as_read/",
        method: "POST",
        body: { notification_id },
      }),
      invalidatesTags: ["Notification"],
    }),

    customerMarkAllNotificationsAsRead: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/user/notifications/mark_all_as_read/",
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),

    customerDeleteNotification: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/user/notifications/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    customerArchiveNotification: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/user/notifications/${id}/archive/`,
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),

    customerGetNotificationStats: builder.query<
      { success: boolean; data: NotificationStats },
      void
    >({
      query: () => "/user/notifications/stats/",
      providesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
  usePartialUpdateCustomerProfileMutation,
  useUploadCustomerPhotoMutation,
  useChangeCustomerPasswordMutation,
  useDeleteCustomerAccountMutation,
  useGetCustomerNotificationsQuery,
  useCustomerMarkNotificationAsReadMutation,
  useCustomerMarkAllNotificationsAsReadMutation,
  useCustomerDeleteNotificationMutation,
  useCustomerArchiveNotificationMutation,
  useCustomerGetNotificationStatsQuery,
  useGetCustomerWalletQuery,
  useGetCustomerWalletTransactionsQuery,
  useRequestCustomerWithdrawalMutation,
  useSetCustomerPaymentPinMutation,
} = customerApi;
