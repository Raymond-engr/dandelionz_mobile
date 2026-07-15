import { baseApi } from "./baseApi";

interface VendorProfile {
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
  store_name: string;
  store_description: string;
  business_registration_number: string;
  address: string;
  latitude?: number;
  longitude?: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  recipient_code: string;
  is_verified_vendor: boolean;
}

interface Video {
  id: number;
  video: string;
  video_url: string;
  title: string | null;
  description: string | null;
  duration: string | null;
  file_size: number | null;
  uploaded_at: string;
  updated_at: string;
}

interface Product {
  slug: string;
  name: string;
  description: string;
  price: string;
  discounted_price: string | null;
  category: string;
  brand: string;
  stock: number;
  image?: string;
  images: any[];
  videos?: Video[];
  variants: {
    colors: string[];
    sizes: string[];
  };
  tags: string[];
  publish_status: string;
  approval_status: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  uuid: string;
  order_id: string;
  customer: {
    uuid: string;
    full_name: string;
    email: string;
    phone_number: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    price: string;
    item_subtotal?: string;
  }>;
  total_amount: string;
  total_price?: string; // Add this as it might come from the other endpoint
  status: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  ordered_at?: string; // Add this
  timeline?: {
    status?: string;
    label: string;
    timestamp: string | null;
    completed: boolean;
  }[];
  order_items?: any[]; // Fallback for differing structures
}

interface VendorAnalytics {
  total_balance: number;
  total_orders: number;
  total_products_sold: number;
  new_customers: number;
}

interface WalletBalance {
  withdrawable_balance: number;
  available_balance: number;
  pending_balance: number;
  pending_order_count: number;
  total_earnings: number;
  total_credits: number;
  total_debits: number;
  total_withdrawals: number;
  this_month_earnings: number;
}

interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: string;
  description: string;
  status: "successful" | "failed" | "pending";
  created_at: string;
}

interface PaginatedTransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

interface PaymentSettings {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  recipient_code: string;
  has_pin: boolean;
}

export interface Bank {
  name: string;
  code: string;
  active: boolean;
}

export interface BankVerificationResponse {
  success: boolean;
  data: {
    account_name: string;
    account_number: string;
    bank_id: string;
  };
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

interface OrderSummary {
  pending: number;
  paid: number;
  shipped: number;
  delivered: number;
  canceled: number;
}

export interface VendorProfileUpdateRequest {
  full_name?: string;
  phone_number?: string;
  store_name?: string;
  store_description?: string;
  address?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
}

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Profile Management
    getVendorProfile: builder.query<
      { success: boolean; data: VendorProfile },
      void
    >({
      query: () => "/user/vendor/profile/",
      providesTags: ["Vendor"],
    }),

    partialUpdateVendorProfile: builder.mutation<
      { success: boolean; data: VendorProfile },
      FormData
    >({
      query: (body) => ({
        url: "/user/vendor/profile/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Vendor"],
    }),

    updateVendorProfile: builder.mutation<
      { success: boolean; data: VendorProfile },
      VendorProfileUpdateRequest
    >({
      query: (body) => ({
        url: "/user/vendor/profile/",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Vendor"],
    }),

    uploadVendorPhoto: builder.mutation<
      { success: boolean; data: VendorProfile },
      FormData
    >({
      query: (body) => ({
        url: "/user/vendor/account/photo/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vendor"],
    }),

    changeVendorPassword: builder.mutation<
      { success: boolean; message: string },
      { current_password: string; new_password: string }
    >({
      query: (body) => ({
        url: "/user/vendor/change-password/",
        method: "POST",
        body,
      }),
    }),

    // --- Store Product Management ---
    getStoreProducts: builder.query<
      { success: boolean; data: Product[] },
      { status?: string }
    >({
      query: (params) => ({
        url: "/user/vendor/products/",
        params,
      }),
      providesTags: ["Product"],
    }),

    createStoreProduct: builder.mutation<
      { success: boolean; data: Product },
      FormData
    >({
      query: (body) => ({
        url: "/user/vendor/products/add/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product", "Draft"],
    }),

    getStoreProductDetails: builder.query<
      { success: boolean; data: Product },
      string
    >({
      query: (slug) => `/user/vendor/products/${slug}/`,
      providesTags: ["Product"],
    }),

    updateStoreProduct: builder.mutation<
      { success: boolean; data: Product },
      { slug: string; data: FormData }
    >({
      query: ({ slug, data }) => ({
        url: `/user/vendor/products/${slug}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    partialUpdateStoreProduct: builder.mutation<
      { success: boolean; data: Product },
      { slug: string; data: Partial<Product> }
    >({
      query: ({ slug, data }) => ({
        url: `/user/vendor/products/${slug}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteStoreProduct: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (slug) => ({
        url: `/user/vendor/products/${slug}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // --- Draft Management ---
    getDrafts: builder.query<{ success: boolean; data: Product[] }, void>({
      query: () => "/store/vendor/drafts/",
      providesTags: ["Draft"],
    }),

    getDraftDetails: builder.query<{ success: boolean; data: Product }, string>({
      query: (slug) => `/store/vendor/drafts/${slug}/`,
      providesTags: ["Draft"],
    }),

    createDraft: builder.mutation<{ success: boolean; data: Product }, FormData>({
      query: (body) => ({
        url: "/store/products/create/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Draft"],
    }),

    patchProduct: builder.mutation<
      { success: boolean; data: Product },
      { slug: string; data: FormData }
    >({
      query: ({ slug, data }) => ({
        url: `/store/products/${slug}/patch/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product", "Draft"],
    }),

    updateDraft: builder.mutation<
      { success: boolean; data: Product },
      { slug: string; data: FormData }
    >({
      query: ({ slug, data }) => ({
        url: `/store/vendor/drafts/${slug}/update/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Draft", "Product"],
    }),

    submitDraft: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (slug) => ({
        url: `/store/vendor/drafts/${slug}/submit/`,
        method: "POST",
      }),
      invalidatesTags: ["Draft", "Product"],
    }),

    deleteDraft: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (slug) => ({
        url: `/store/vendor/drafts/${slug}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Draft"],
    }),

    // Order Management
    getVendorOrdersSummary: builder.query<
      { success: boolean; data: OrderSummary },
      void // No params for summary
    >({
      query: () => ({
        url: "/user/vendor/orders/",
      }),
      providesTags: ["Order"],
    }),

    getVendorOrdersList: builder.query<
      { success: boolean; data: Order[] },
      { limit?: number; offset?: number; status?: string } // Example params
    >({
      query: (params) => ({
        url: "/user/vendor/orders/list/",
        params,
      }),
      providesTags: ["Order"],
    }),

    getVendorOrderDetails: builder.query<
      { success: boolean; data: Order },
      string
    >({
      query: (uuid) => `/user/vendor/orders/${uuid}/`,
      providesTags: ["Order"],
    }),

    updateVendorOrderStatus: builder.mutation<
      { success: boolean; data: Order },
      { uuid: string; status: string }
    >({
      query: ({ uuid, ...body }) => ({
        url: `/user/vendor/orders/${uuid}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    // Analytics
    getVendorAnalyticsSelf: builder.query<
      { success: boolean; data: VendorAnalytics },
      void
    >({
      query: () => "/user/vendor/analytics/",
      providesTags: ["Analytics"],
    }),

    // Wallet Management
    getWalletBalance: builder.query<
      { success: boolean; data: WalletBalance },
      void
    >({
      query: () => "/vendor/wallet/",
      providesTags: ["Payment"],
    }),

    vendorRequestWithdrawal: builder.mutation<
      { success: boolean; message: string; reference?: string },
      { amount: string; pin: string }
    >({
      query: (body) => ({
        url: "/vendor/wallet/withdraw/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),

    getTransactionHistory: builder.query<
      PaginatedTransactionsResponse,
      { limit?: number; offset?: number; type?: string }
    >({
      query: (params) => ({
        url: "/vendor/wallet/transactions/",
        params,
      }),
      providesTags: ["Payment"],
    }),

    // Payment Settings
    getPaymentSettings: builder.query<
      { success: boolean; data: PaymentSettings },
      void
    >({
      query: () => "/vendor/payment-settings/",
      providesTags: ["Payment"],
    }),

    updatePaymentSettings: builder.mutation<
      { success: boolean; message: string },
      Partial<PaymentSettings>
    >({
      query: (body) => ({
        url: "/vendor/payment-settings/",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),

    setPaymentPIN: builder.mutation<
      { success: boolean; message: string },
      { pin: string; confirm_pin: string }
    >({
      query: (body) => ({
        url: "/vendor/payment-settings/pin/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),

    verifyPaymentPIN: builder.mutation<
      { success: boolean; valid: boolean },
      { pin: string }
    >({
      query: (body) => ({
        url: "/vendor/payment-settings/pin/verify/",
        method: "POST",
        body,
      }),
    }),

    requestPINReset: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/vendor/payment-settings/pin/forgot/",
        method: "POST",
      }),
    }),

    getBanks: builder.query<{ success: boolean; data: Bank[] }, void>({
      query: () => "/user/utility/banks/",
    }),

    verifyBankAccount: builder.mutation<BankVerificationResponse, { account_number: string; bank_code: string }>({
      query: (body) => ({
        url: "/user/utility/verify-account/",
        method: "POST",
        body,
      }),
    }),

    // Notifications
    getVendorNotifications: builder.query<
      { success: boolean; data: Notification[] },
      { page?: number; page_size?: number; is_read?: boolean } | void
    >({
      query: (params) => ({
        url: "/user/notifications/",
        params: params || undefined,
      }),
      providesTags: ["Notification"],
    }),

    vendorMarkNotificationAsRead: builder.mutation<
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

    vendorMarkAllNotificationsAsRead: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/user/notifications/mark_all_as_read/",
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),

    vendorDeleteNotification: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/user/notifications/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    vendorArchiveNotification: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/user/notifications/${id}/archive/`,
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),

    vendorGetNotificationStats: builder.query<
      { success: boolean; data: NotificationStats },
      void
    >({
      query: () => "/user/notifications/stats/",
      providesTags: ["Notification"],
    }),

    vendorBulkDeleteNotifications: builder.mutation<
      { success: boolean; message: string },
      string[]
    >({
      query: (notification_ids) => ({
        url: "/user/notifications/bulk_delete/",
        method: "POST",
        body: { notification_ids },
      }),
      invalidatesTags: ["Notification"],
    }),

    // Account Management
    deleteAccount: builder.mutation<void, { password: string }>({
      query: (body) => ({
        url: "/user/vendor/account/",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Vendor", "Auth"],
    }),
  }),
});

export const {
  useGetVendorProfileQuery,
  usePartialUpdateVendorProfileMutation,
  useUpdateVendorProfileMutation,
  useUploadVendorPhotoMutation,
  useChangeVendorPasswordMutation,
  useGetStoreProductsQuery,
  useCreateStoreProductMutation,
  useGetStoreProductDetailsQuery,
  useUpdateStoreProductMutation,
  usePartialUpdateStoreProductMutation,
  useDeleteStoreProductMutation,
  useGetDraftsQuery,
  useGetDraftDetailsQuery,
  useCreateDraftMutation,
  usePatchProductMutation,
  useUpdateDraftMutation,
  useSubmitDraftMutation,
  useDeleteDraftMutation,
  useGetVendorOrdersSummaryQuery,
  useGetVendorOrdersListQuery,
  useGetVendorOrderDetailsQuery,
  useUpdateVendorOrderStatusMutation,
  useGetVendorAnalyticsSelfQuery,
  useGetWalletBalanceQuery,
  useVendorRequestWithdrawalMutation,
  useGetTransactionHistoryQuery,
  useGetPaymentSettingsQuery,
  useUpdatePaymentSettingsMutation,
  useSetPaymentPINMutation,
  useVerifyPaymentPINMutation,
  useRequestPINResetMutation,
  useGetBanksQuery,
  useVerifyBankAccountMutation,
  useGetVendorNotificationsQuery,
  useVendorMarkNotificationAsReadMutation,
  useVendorMarkAllNotificationsAsReadMutation,
  useVendorDeleteNotificationMutation,
  useVendorArchiveNotificationMutation,
  useVendorGetNotificationStatsQuery,
  useVendorBulkDeleteNotificationsMutation,
  useDeleteAccountMutation,
} = vendorApi;
