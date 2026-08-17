import { baseApi } from "./baseApi";
import type { InstallmentPlan } from "./publicApi";

interface AdminProfile {
  uuid: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  profile_picture: string | null;
  role?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  position?: string;
  can_manage_vendors?: boolean;
  can_manage_orders?: boolean;
  can_manage_payouts?: boolean;
  can_manage_inventory?: boolean;
}
interface Analytics {
  total_orders: number;
  total_revenue: string;
  pending_orders: number;
  total_vendors: number;
}

interface DetailedAnalytics {
  total_sales: string;
  total_vendors: number;
  total_orders: number;
  total_users: number;
  sales_chart_data: { period: string; sales: string }[];
  order_stats: {
    completed: number;
    pending: number;
    cancelled: number;
    returned: number;
  };
}

export interface AnalyticsQueryParams {
  period?: "weekly" | "monthly" | "annual" | "custom";
  start_date?: string;
  end_date?: string;
  sales_period?: string; // Legacy support
}

interface OrderSummary {
  pending: number;
  shipped: number;
  delivered: number;
}

export interface Vendor {
  user_uuid: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  store_name: string;
  store_description?: string;
  business_registration_number?: string;
  address?: string;
  commission_rate?: string | null; // Platform commission for this vendor (decimal); null = platform default
  bank_name?: string;
  account_number?: string;
  recipient_code?: string;
  is_verified_vendor: boolean;
  is_active: boolean;
  is_verified?: boolean;
  created_at?: string;
}

export interface User {
  uuid: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  is_verified: boolean;
  status: string;
  created_at: string;
  address?: string;
  total_spend?: string;
  total_orders?: string;
  suspension_history?: {
    id: number;
    action: string;
    reason: string;
    admin_email: string;
    created_at: string;
  }[];
}

export interface Order {
  order_id: string;
  customer: {
    uuid: string;
    full_name: string;
    email: string;
    phone_number: string;
  };
  current_status: string;
  status: string;
  payment_status: string;
  total_price: string;
  delivery_fee: string;
  /** Whether the delivery fee has been settled. Only meaningful when delivery_fee > 0. */
  delivery_fee_paid?: boolean;
  /** Start of the promised delivery window (ISO), or null until scheduled. */
  expected_delivery_earliest?: string | null;
  /** End of the promised delivery window (ISO), or null until scheduled. */
  expected_delivery_latest?: string | null;
  discount: string;
  tracking_number: string | null;
  ordered_at: string;
  updated_at: string;
  order_items: OrderItem[];
  status_history?: {
    id: number;
    status: string;
    changed_by: string;
    admin_email: string | null;
    reason: string;
    changed_at: string;
  }[];
  installment_plan?: {
    id: number;
    status: string;
    total_amount: number;
    amount_paid: number;
    balance_remaining: number;
    paid_fraction: number;
  } | null;
  // Optional fields for legacy compatibility
  vendor?: {
    uuid: string;
    store_name: string;
  };
  total_with_delivery?: string;
  shipping_address?: ShippingAddress | null;
  customer_lat?: number | null;
  customer_lng?: number | null;
  timeline?: {
    status: string;
    label: string;
    timestamp: string | null;
    completed: boolean;
  }[];
  is_cancelled?: boolean;
  refund_request?: any;
}

export interface Product {
  slug: string;
  name: string;
  price: string;
  vendor: {
    uuid: string;
    store_name: string;
  };
  category: string;
  status: string;
  stock: number;
  discount?: number; // Added discount field
  commission_rate?: string | null; // Per-product commission override (decimal); null = vendor/platform rate
}

interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: string;
  category: number;
  category_name: string;
  stock: number;
  image: string | null; // Product image URL
  images?: any[]; // Added images array
  discount?: number; // Added discount field
  uploadDate: string; // Date when the product was uploaded
  vendor: {
    uuid: string;
    store_name: string;
    email: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED"; // Specific status for admin actions
  commission_rate?: string | null; // Per-product commission override (decimal); null = vendor/platform rate
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean; // Added based on backend guide
  created_at: string;
  updated_at: string; // Added based on backend guide
  product_count: number;
  total_sales: string;
}

interface Payment {
  id: string;
  order_uuid: string;
  amount: string;
  payment_method: string;
  status: string;
  created_at: string;
}

interface Settlement {
  id: string;
  vendor_uuid: string;
  vendor_name: string;
  amount: string;
  status: string;
  created_at: string;
}

export interface WalletStats {
  withdrawable_balance: string;
  available_balance: string;
  total_earnings: string;
  total_withdrawals: number;
  this_month_earnings: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  status: string;
  created_at: string;
}

export interface AdminPaymentSettings {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
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

export interface SettlementSummary {
  total_revenue: string;
  total_payouts: string;
  pending_settlements: string;
  upcoming_payouts: number;
}

export interface VendorSettlement {
  id: string;
  vendor_name: string;
  amount: string;
  payout_date: string;
  status: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  customer_name: string;
  vendor_name: string;
  amount: string;
  reason: string;
  status: string;
  created_at: string;
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
  notification_type?: NotificationType; // Optional as backend sends flat fields
  notification_type_display?: string | null;
  notification_type_icon?: string | null;
  notification_type_color?: string | null;
  recipient_type?: "USERS" | "VENDORS" | "ALL" | "ADMIN";
  recipient_group?: "customer" | "vendor" | "admin" | "all";
  status?: string;
  priority: string;
  category?: string;
  action_url: string | null;
  action_text: string | null;
  is_read: boolean;
  is_active: boolean;
  is_archived?: boolean;
  is_draft?: boolean;
  created_at: string;
  sent_at?: string | null;
  read_at: string | null;
  scheduled_at: string | null;
  scheduled_for?: string | null;
}

interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  last_notification_time: string | null;
}

export interface ShippingAddress {
  full_name?: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  postal_code?: string;
  phone_number?: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: string;
  item_subtotal: number;
  vendor_name: string;
  // Legacy support
  product?: {
    id: number;
    name: string;
    price: string;
    description?: string;
    brand?: string;
    images?: any[];
  };
}

export interface Withdrawal {
  id: number;
  reference: string;
  amount: string;
  requestor_name: string;
  requestor_email: string;
  requestor_type: "Vendor" | "Customer";
  status: "pending" | "processing" | "successful" | "failed" | "cancelled";
  bank_name: string;
  account_number: string;
  account_name: string;
  created_at: string;
  processed_at: string | null;
  failure_reason: string | null;
  notes?: string | null;
}

export interface WithdrawalDetail extends Withdrawal {
  requestor_id: string;
  recipient_code?: string;
}

/** One movement of money. The ledger is append-only, so these are read-only everywhere. */
export interface LedgerEntry {
  id: number;
  created_at: string;
  user_email: string;
  user_name: string;
  direction: "CREDIT" | "DEBIT";
  bucket: "SPENDABLE" | "WITHDRAWABLE";
  entry_type: string;
  entry_type_display: string;
  /** Always positive. `direction` carries the sign; apply it at render time. */
  amount: string;
  balance_after: string;
  reference: string;
  description: string;
  order_id: string | null;
  payout_reference: string | null;
  operation_key: string;
}

export interface LedgerFilters {
  date_from?: string;
  date_to?: string;
  entry_type?: string;
  direction?: string;
  bucket?: string;
  user?: string;
  reference?: string;
  search?: string;
  page?: number;
}

export interface LedgerBreakdownRow {
  entry_type?: string;
  bucket?: string;
  direction: string;
  total: string;
  count: number;
}

export interface LedgerSummary {
  filters: Record<string, string | null>;
  count: number;
  total_credits: string;
  total_debits: string;
  /** Credits minus debits for the filtered slice. Not a balance: the ledger spans wallets. */
  net: string;
  by_type: LedgerBreakdownRow[];
  by_bucket: LedgerBreakdownRow[];
}

/**
 * A Paystack delivery that produced no ledger entry.
 *
 * Kept separate from the ledger on purpose: the ledger is what actually happened to
 * balances, so folding failures into it would make every total wrong.
 */
export interface FailedPaymentEvent {
  id: number;
  event_id: string;
  event_type: string;
  reference: string;
  status: string;
  error_message: string;
  signature_valid: boolean;
  received_at: string;
  processed_at: string | null;
}

export interface RefundRequest {
  id: number;
  order_id: string;
  customer_name: string;
  customer_email: string;
  amount: string;
  status: string;
  reason: string;
  created_at: string;
  processed_at: string | null;
  payment_reference: string;
}

/**
 * A customer whose refund behaviour looks worth a human glance. This is a
 * review signal only — flagged customers are never blocked, throttled, or
 * charged differently. It just surfaces who to look at first.
 */
export interface RefundFlagRow {
  uuid: string;
  email: string;
  full_name: string;
  paid_orders: number;
  refund_count: number;
  /** Share of paid orders that were refunded, as a fraction (e.g. 0.42 = 42%). */
  refund_rate: number;
}

/** The refund-abuse review queue, most-refunded first. */
export interface RefundFlagsData {
  count: number;
  results: RefundFlagRow[];
}

/**
 * One customer's full refund picture for the detail screen. `needs_review`
 * gates the attention badge; `flagged` means they cross the thresholds but may
 * already have been looked at (reviewing snoozes the flag until they refund
 * more). Neither ever blocks the customer.
 */
export interface RefundProfile {
  uuid: string;
  email: string;
  full_name: string;
  paid_orders: number;
  refund_count: number;
  /** Share of paid orders that were refunded, as a fraction (e.g. 0.42 = 42%). */
  refund_rate: number;
  flagged: boolean;
  needs_review: boolean;
  reviewed_count: number;
  thresholds: {
    min_orders: number;
    min_refunds: number;
    rate: number;
  };
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Profile Management
    getAdminProfile: builder.query<
      { success: boolean; data: AdminProfile },
      void
    >({
      query: () => "/user/admin/account/profile/",
      providesTags: ["Admin"],
    }),

    changeAdminPassword: builder.mutation<
      { success: boolean; message: string },
      { current_password: string; new_password: string }
    >({
      query: (body) => ({
        url: "/user/admin/change-password/",
        method: "POST",
        body,
      }),
    }),

    updateAdminProfile: builder.mutation<
      { success: boolean; data: AdminProfile },
      { full_name: string; phone_number: string }
    >({
      query: (body) => ({
        url: "/user/admin/account/profile/",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),

    uploadAdminPhoto: builder.mutation<
      { success: boolean; data: { profile_picture: string } },
      FormData
    >({
      query: (body) => ({
        url: "/user/admin/account/photo/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),

    // Admin Wallet & Withdrawals
    getWalletStats: builder.query<
      { success: boolean; data: WalletStats },
      void
    >({
      query: () => "/user/admin/wallet/",
      providesTags: ["Wallet"],
    }),

    getWalletTransactions: builder.query<
      { success: boolean; data: WalletTransaction[] },
      void
    >({
      query: () => "/user/admin/wallet/transactions/",
      providesTags: ["Wallet"],
    }),

    adminRequestWithdrawal: builder.mutation<
      { success: boolean; message: string },
      { amount: string; pin: string }
    >({
      query: (body) => ({
        url: "/user/admin/wallet/withdraw/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),

    // Admin Payment Settings
    getAdminPaymentSettings: builder.query<
      { success: boolean; data: AdminPaymentSettings },
      void
    >({
      query: () => "/user/admin/payment-settings/",
      providesTags: ["AdminPaymentSettings"],
    }),

    updateAdminPaymentSettings: builder.mutation<
      { success: boolean; data: AdminPaymentSettings },
      Partial<AdminPaymentSettings>
    >({
      query: (body) => ({
        url: "/user/admin/payment-settings/",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminPaymentSettings"],
    }),

    changePaymentPin: builder.mutation<
      { success: boolean; message: string },
      { current_pin?: string; new_pin: string; confirm_pin: string }
    >({
      query: (body) => ({
        url: "/user/admin/payment-settings/pin/",
        method: "POST",
        body,
      }),
    }),

    forgotPaymentPin: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/user/admin/payment-settings/pin/forgot/",
        method: "POST",
      }),
    }),

    // Settlements & Payouts (Platform Dashboard)
    getSettlementSummary: builder.query<
      { success: boolean; data: SettlementSummary },
      void
    >({
      query: () => "/user/admin/settlements/summary/",
      providesTags: ["Settlement"],
    }),

    getVendorSettlements: builder.query<
      { success: boolean; data: VendorSettlement[] },
      { status?: string }
    >({
      query: (params) => ({
        url: "/user/admin/settlements/vendor/",
        params,
      }),
      providesTags: ["Settlement"],
    }),

    // Disputes
    getAllDisputes: builder.query<
      { success: boolean; data: Dispute[] },
      { status?: string }
    >({
      query: (params) => ({
        url: "/user/admin/settlements/disputes/",
        params,
      }),
      providesTags: ["Settlement"],
    }),

    resolveDispute: builder.mutation<
      { success: boolean; message: string },
      { id: string; action: string; admin_note?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/user/admin/settlements/disputes/${id}/resolve/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settlement"],
    }),

    // Refunds
    // Finance ledger. Mobile is a read-and-review surface: the list and the summary, no
    // export. Downloading a spreadsheet onto a phone is not a workflow anyone wants, and
    // the web page owns that job.
    getLedger: builder.query<
      {
        count: number;
        next: string | null;
        previous: string | null;
        results: LedgerEntry[];
      },
      LedgerFilters | void
    >({
      query: (params) => ({
        url: "/transactions/admin/ledger/",
        params: params || undefined,
      }),
      providesTags: ["Ledger"],
    }),

    getLedgerSummary: builder.query<
      { success: boolean; data: LedgerSummary },
      LedgerFilters | void
    >({
      query: (params) => ({
        url: "/transactions/admin/ledger/summary/",
        params: params || undefined,
      }),
      providesTags: ["Ledger"],
    }),

    getFailedPayments: builder.query<
      { count: number; results: FailedPaymentEvent[] },
      { status?: string; event_type?: string } | void
    >({
      query: (params) => ({
        url: "/transactions/admin/failed-payments/",
        params: params || undefined,
      }),
      providesTags: ["Ledger"],
    }),

    getAdminRefunds: builder.query<
      {
        success: boolean;
        data: RefundRequest[];
        count: number;
        pending_count: number;
      },
      { status?: string } | void
    >({
      query: (params) => ({
        url: "/user/admin/finance/refunds/",
        params: params || undefined,
      }),
      providesTags: ["Refunds"],
    }),

    processAdminRefund: builder.mutation<
      { success: boolean; message: string },
      {
        refund_id: number;
        action: "APPROVE" | "REJECT";
        rejection_reason?: string;
      }
    >({
      query: (body) => ({
        url: "/user/admin/finance/refunds/process/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Refunds", "Order", "Wallet"],
    }),

    // Analytics
    getAnalytics: builder.query<
      { success: boolean; data: Analytics },
      AnalyticsQueryParams | void
    >({
      query: (params) => ({
        url: "/user/admin/analytics/",
        params: params || undefined,
      }),
      providesTags: ["Analytics"],
    }),

    getDetailedAnalytics: builder.query<
      { success: boolean; data: DetailedAnalytics },
      AnalyticsQueryParams | void
    >({
      query: (params) => ({
        url: "/user/admin/analytics/detailed/",
        params: params || undefined,
      }),
      providesTags: ["Analytics"],
    }),

    // User Management
    // AdminUserListView's paginated branch returns DRF's paginated envelope
    // directly (count/next/previous/results) with no outer {success, data}
    // wrapper - that wrapper only applies to its unpaginated fallback path,
    // which this app never hits now that pagination_class is set. See
    // authentication/views_admin.py AdminUserListView.list().
    getAllUsers: builder.query<
      {
        count: number;
        next: string | null;
        previous: string | null;
        results: User[];
      },
      {
        role?: string;
        status?: string;
        search?: string;
        page?: number;
        page_size?: number;
      }
    >({
      query: (params) => ({
        url: "/user/admin/users/",
        params,
      }),
      providesTags: ["User"],
      serializeQueryArgs: ({ queryArgs }) => {
        const { page: _page, ...filterArgs } = queryArgs;
        return filterArgs;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!arg.page || arg.page === 1 || !currentCache?.results) {
          return newItems;
        }
        currentCache.results.push(...newItems.results);
        currentCache.next = newItems.next;
        currentCache.count = newItems.count;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
    }),

    getUserDetails: builder.query<{ success: boolean; data: User }, string>({
      query: (uuid) => `/user/admin/users/${uuid}/`,
      providesTags: ["User"],
    }),

    suspendUser: builder.mutation<
      { success: boolean; suspended: boolean },
      { user_uuid: string; suspend: boolean }
    >({
      query: (body) => ({
        url: "/user/admin/users/suspend/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Vendor"],
    }),

    updateUserStatus: builder.mutation<
      { success: boolean; message: string },
      { uuid: string; action: "suspend" | "activate"; reason: string }
    >({
      query: ({ uuid, action, reason }) => ({
        url: `/user/admin/users/${uuid}/${action}/`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["User"],
    }),

    activateUser: builder.mutation<
      { success: boolean; message: string },
      { uuid: string; reason: string }
    >({
      query: ({ uuid, ...body }) => ({
        url: `/user/admin/users/${uuid}/activate/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // Refund-abuse flagging (review-only; never blocks a customer)
    // The review queue: customers who refund a suspicious share of their orders,
    // most-refunded first. Powers the "needs attention" banner on the users tab.
    getRefundFlags: builder.query<
      { success: boolean; data: RefundFlagsData },
      void
    >({
      query: () => "/user/admin/customers/refund-flags/",
      providesTags: ["User"],
    }),

    // One customer's refund profile for the detail screen's "Refund history".
    getCustomerRefundProfile: builder.query<
      { success: boolean; data: RefundProfile },
      string
    >({
      query: (uuid) => `/user/admin/customers/${uuid}/refund-profile/`,
      providesTags: ["User"],
    }),

    // Mark a flag reviewed. Doesn't block anyone — it just snoozes the flag
    // until the customer refunds more, so the queue and profile both refresh.
    reviewRefundFlag: builder.mutation<
      { success: boolean; data: RefundProfile; message: string },
      string
    >({
      query: (uuid) => ({
        url: `/user/admin/customers/${uuid}/refund-flag/review/`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // Vendor Management
    getAllVendors: builder.query<{ success: boolean; data: Vendor[] }, void>({
      query: () => "/user/admin/vendors/",
      providesTags: ["Vendor"],
    }),

    getVendorDetails: builder.query<{ success: boolean; data: Vendor }, string>(
      {
        query: (uuid) => `/user/admin/vendors/${uuid}/`,
        providesTags: ["Vendor"],
      },
    ),

    approveVendor: builder.mutation<
      { success: boolean; approved: boolean },
      { user_uuid: string; approve: boolean }
    >({
      query: (body) => ({
        url: "/user/admin/vendors/approve/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vendor"],
    }),

    verifyVendorKYC: builder.mutation<
      { success: boolean; message: string },
      { user_uuid: string; approve: boolean }
    >({
      query: (body) => ({
        url: "/user/admin/vendors/verify-kyc/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vendor"],
    }),

    suspendVendor: builder.mutation<
      { success: boolean; suspended: boolean },
      { uuid: string; suspend: boolean }
    >({
      query: ({ uuid, ...body }) => ({
        url: `/user/admin/vendors/${uuid}/suspend/`,
        method: "POST", // SoT says POST or PUT, keeping POST
        body,
      }),
      invalidatesTags: ["Vendor"],
    }),

    // Set or clear a vendor's platform commission rate. Send a decimal 0-0.10, or null to
    // clear the override and fall back to the platform default. Capped server-side at 10%.
    setVendorCommission: builder.mutation<
      {
        success: boolean;
        data: {
          vendor_uuid: string;
          commission_rate: string | null;
          effective_rate: string;
          effective_rate_label: string;
        };
      },
      { uuid: string; commission_rate: number | null }
    >({
      query: ({ uuid, commission_rate }) => ({
        url: `/user/admin/vendors/${uuid}/commission/`,
        method: "PATCH",
        body: { commission_rate },
      }),
      invalidatesTags: ["Vendor", "Product"],
    }),

    getVendorProducts: builder.query<
      { success: boolean; data: Product[] },
      string
    >({
      query: (uuid) => `/user/admin/vendors/${uuid}/products/`,
      providesTags: ["Product"],
    }),

    adminGetVendorOrders: builder.query<
      { success: boolean; data: Order[] },
      string
    >({
      query: (uuid) => `/user/admin/vendors/${uuid}/orders/`,
      providesTags: ["Order"],
    }),

    adminGetVendorAnalytics: builder.query<
      { success: boolean; data: Analytics },
      string
    >({
      query: (uuid) => `/user/admin/vendors/${uuid}/analytics/`,
      providesTags: ["Analytics"],
    }),

    // Order Management
    getOrderSummary: builder.query<
      { success: boolean; data: OrderSummary },
      void
    >({
      query: () => "/user/admin/orders/summary/",
      providesTags: ["Order"],
    }),

    getAllOrders: builder.query<
      Order[],
      { status?: string; vendor_uuid?: string }
    >({
      query: (params) => ({
        url: "/user/admin/orders/",
        params,
      }),
      transformResponse: (response: { success: boolean; data: Order[] }) =>
        response.data,
      providesTags: ["Order"],
    }),

    getAdminOrderDetails: builder.query<Order, string>({
      query: (order_id) => `/user/admin/orders/${order_id}/`,
      transformResponse: (response: { success: boolean; data: Order }) =>
        response.data,
      providesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation<
      { success: boolean; data: Order },
      { order_id: string; status: string }
    >({
      query: ({ order_id, ...body }) => ({
        url: `/user/admin/orders/${order_id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    // Schedule the delivery window and/or set the fee for an order. Send explicit
    // earliest/latest ISO strings, or use_default to let the backend apply the standard
    // window. delivery_fee is always required.
    setOrderDelivery: builder.mutation<
      { success: boolean; data: Order; message?: string },
      {
        order_id: string;
        use_default?: boolean;
        expected_delivery_earliest?: string;
        expected_delivery_latest?: string;
        delivery_fee: number;
      }
    >({
      query: ({ order_id, ...body }) => ({
        url: `/user/admin/orders/${order_id}/delivery/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    // Orders needing delivery attention, bucketed: no window set, fee owed, or scheduled
    // and paid but not yet shipped.
    getDeliveryAttention: builder.query<
      {
        success: boolean;
        data: {
          counts: {
            unscheduled: number;
            awaiting_fee: number;
            ready_to_ship: number;
          };
          unscheduled: Order[];
          awaiting_fee: Order[];
          ready_to_ship: Order[];
        };
      },
      void
    >({
      query: () => "/user/admin/orders/delivery/attention/",
      providesTags: ["Order"],
    }),

    cancelOrderWithReason: builder.mutation<
      { success: boolean; message: string },
      { order_id: string; reason: string }
    >({
      query: ({ order_id, ...body }) => ({
        url: `/user/admin/orders/${order_id}/cancel/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    assignLogistics: builder.mutation<
      { success: boolean; message: string },
      { order_uuid: string }
    >({
      query: (body) => ({
        url: "/user/admin/orders/assign-logistics/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    processRefund: builder.mutation<
      { success: boolean; message: string },
      { order_uuid: string }
    >({
      query: (body) => ({
        url: "/user/admin/orders/refund/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order", "Payment"],
    }),

    getOrderItems: builder.query<{ success: boolean; data: any[] }, string>({
      query: (uuid) => `/user/admin/orders/${uuid}/items/`,
      providesTags: ["Order"],
    }),

    // Read-only view of an order's installment plan for the order detail screen.
    // Admins can reach the shared installment-plans endpoint directly.
    getAdminInstallmentPlan: builder.query<
      { success: boolean; data: InstallmentPlan },
      number
    >({
      query: (id) => `/transactions/installment-plans/${id}/`,
      providesTags: ["Order"],
    }),

    // Product Management
    getAllProducts: builder.query<
      { success: boolean; data: Product[] },
      { status?: string; category?: string }
    >({
      query: (params) => ({
        url: "/user/admin/products/",
        params,
      }),
      providesTags: ["Product"],
    }),

    getProductDetails: builder.query<
      { success: boolean; data: Product },
      string
    >({
      query: (slug) => `/user/admin/products/${slug}/`,
      providesTags: ["Product"],
    }),

    getAdminProductDetails: builder.query<
      { success: boolean; data: AdminProduct },
      string
    >({
      query: (slug) => `/store/admin/products/${slug}/`,
      providesTags: ["Product"],
    }),

    approveProduct: builder.mutation<
      { success: boolean; message: string },
      { slug: string; approve: boolean }
    >({
      query: ({ slug, ...body }) => ({
        url: `/user/admin/products/${slug}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    // Set or clear a product's commission-rate override. Send a decimal 0-0.10, or null to
    // clear it so the vendor/platform rate applies. Capped server-side at 10%.
    setProductCommission: builder.mutation<
      {
        success: boolean;
        data: {
          slug: string;
          commission_rate: string | null;
          effective_rate: string;
          effective_rate_label: string;
        };
      },
      { slug: string; commission_rate: number | null }
    >({
      query: ({ slug, commission_rate }) => ({
        url: `/user/admin/products/${slug}/commission/`,
        method: "PATCH",
        body: { commission_rate },
      }),
      invalidatesTags: ["Product"],
    }),

    approveProductAdmin: builder.mutation<
      { success: boolean; message: string },
      string // Only slug is required in the URL
    >({
      query: (slug) => ({
        url: `/store/admin/products/${slug}/approve/`,
        method: "POST",
      }),
      invalidatesTags: ["Product"],
    }),

    rejectProductAdmin: builder.mutation<
      { success: boolean; message: string },
      { slug: string; reason?: string }
    >({
      query: ({ slug, ...body }) => ({
        url: `/store/admin/products/${slug}/reject/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (slug) => ({
        url: `/user/admin/products/${slug}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // Category Management
    getAllCategories: builder.query<
      Category[], // Corrected return type
      void
    >({
      query: () => "/store/categories/",
      providesTags: ["Category"],
    }),

    getCategory: builder.query<Category, string>({
      query: (slug) => `/store/categories/${slug}/`,
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<
      Category, // Corrected return type
      FormData
    >({
      query: (body) => ({
        url: "/store/categories/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      Category, // Corrected return type
      { slug: string; data: FormData }
    >({
      query: ({ slug, data }) => ({
        url: `/store/categories/${slug}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (slug) => ({
        url: `/store/categories/${slug}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // Payment Management
    getAllPayments: builder.query<{ success: boolean; data: Payment[] }, void>({
      query: () => "/user/admin/payments/",
      providesTags: ["Payment"],
    }),

    getPaymentDetails: builder.query<
      { success: boolean; data: Payment },
      string
    >({
      query: (id) => `/user/admin/payments/${id}/`,
      providesTags: ["Payment"],
    }),

    // Settlement Management
    getAllSettlements: builder.query<
      { success: boolean; data: Settlement[] },
      void
    >({
      query: () => "/user/admin/settlements/",
      providesTags: ["Settlement"],
    }),

    getPayoutHistory: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => "/user/admin/settlements/payout/",
      providesTags: ["Settlement"],
    }),

    triggerPayout: builder.mutation<
      { success: boolean; message: string },
      { user_uuid: string }
    >({
      query: (body) => ({
        url: "/user/admin/payouts/trigger/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settlement", "Payment"],
    }),

    // Dispute Management
    getDisputeDetails: builder.query<
      { success: boolean; data: Dispute },
      string
    >({
      query: (id) => `/user/admin/settlements/disputes/${id}/`,
      providesTags: ["Settlement"],
    }),

    // Notification Management (Inbox)
    adminGetAllNotifications: builder.query<
      { success: boolean; data: Notification[] },
      { page?: number; page_size?: number; is_read?: boolean } | void
    >({
      query: (params) => ({
        url: "/user/notifications/", // Unified Endpoint
        params: params || undefined,
      }),
      providesTags: ["Notification"],
    }),

    adminMarkNotificationAsRead: builder.mutation<
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

    adminMarkAllNotificationsAsRead: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/user/notifications/mark_all_as_read/",
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Notification Management (System - Admin Only)
    getAdminSystemNotifications: builder.query<
      { success: boolean; data: { results: Notification[]; count: number } },
      { page?: number; is_draft?: boolean } | void
    >({
      query: (params) => ({
        url: "/user/admin/notifications/",
        params: params || undefined,
      }),
      providesTags: ["Notification"],
    }),

    createNotification: builder.mutation<
      { success: boolean; data: Notification },
      Partial<Notification>
    >({
      query: (body) => ({
        url: "/user/admin/notifications/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),

    publishNotification: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (notification_id) => ({
        url: `/user/admin/notifications/publish/${notification_id}/`,
        method: "POST",
      }),
      invalidatesTags: ["Notification"],
    }),

    getNotificationDetails: builder.query<
      { success: boolean; data: Notification },
      string
    >({
      query: (id) => `/user/admin/notifications/${id}/`, // Keeping for admin sent notifications
      providesTags: ["Notification"],
    }),

    deleteSystemNotification: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/user/admin/notifications/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    // New Inbox features
    deleteInboxNotification: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/user/notifications/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    adminGetNotificationStats: builder.query<
      { success: boolean; data: NotificationStats },
      void
    >({
      query: () => "/user/notifications/stats/",
      providesTags: ["Notification"],
    }),

    // Withdrawal Management
    getAllWithdrawals: builder.query<
      { success: boolean; count: number; data: Withdrawal[] },
      { status?: string; type?: string } | void
    >({
      query: (params) => ({
        url: "/admin/finance/withdrawals/",
        params: params || undefined,
      }),
      providesTags: ["Payment"],
    }),

    getWithdrawalDetail: builder.query<
      { success: boolean; data: WithdrawalDetail },
      string | number
    >({
      query: (id) => ({
        url: "/admin/finance/withdrawals/detail/",
        params: { id },
      }),
      providesTags: ["Payment"],
    }),

    getBanks: builder.query<{ success: boolean; data: Bank[] }, void>({
      query: () => "/user/utility/banks/",
    }),

    verifyBankAccount: builder.mutation<
      BankVerificationResponse,
      { account_number: string; bank_code: string }
    >({
      query: (body) => ({
        url: "/user/utility/verify-account/",
        method: "POST",
        body,
      }),
    }),

    approveWithdrawal: builder.mutation<
      { success: boolean; message: string },
      { withdrawal_id: string | number; notes?: string }
    >({
      query: (body) => ({
        url: "/admin/finance/withdrawals/approve/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment", "Settlement"],
    }),

    rejectWithdrawal: builder.mutation<
      { success: boolean; message: string },
      { withdrawal_id: string | number; reason: string }
    >({
      query: (body) => ({
        url: "/admin/finance/withdrawals/reject/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment", "Settlement"],
    }),
  }),
});

export const {
  useGetAdminProfileQuery,
  useChangeAdminPasswordMutation,
  useUpdateAdminProfileMutation,
  useUploadAdminPhotoMutation,
  useGetAnalyticsQuery,
  useGetDetailedAnalyticsQuery,
  useGetAllUsersQuery,
  useGetUserDetailsQuery,
  useSuspendUserMutation,
  useUpdateUserStatusMutation,
  useActivateUserMutation,
  useGetRefundFlagsQuery,
  useGetCustomerRefundProfileQuery,
  useReviewRefundFlagMutation,
  useGetAllVendorsQuery,
  useGetVendorDetailsQuery,
  useApproveVendorMutation,
  useVerifyVendorKYCMutation,
  useSuspendVendorMutation,
  useSetVendorCommissionMutation,
  useGetVendorProductsQuery,
  useAdminGetVendorOrdersQuery,
  useAdminGetVendorAnalyticsQuery,
  useGetOrderSummaryQuery,
  useGetAllOrdersQuery,
  useGetAdminOrderDetailsQuery,
  useUpdateOrderStatusMutation,
  useSetOrderDeliveryMutation,
  useGetDeliveryAttentionQuery,
  useCancelOrderWithReasonMutation,
  useAssignLogisticsMutation,
  useProcessRefundMutation,
  useGetOrderItemsQuery,
  useGetAdminInstallmentPlanQuery,
  useGetAllProductsQuery,
  useGetProductDetailsQuery,
  useGetAdminProductDetailsQuery,
  useApproveProductMutation,
  useSetProductCommissionMutation,
  useApproveProductAdminMutation,
  useRejectProductAdminMutation,
  useDeleteProductMutation,
  useGetAllCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllPaymentsQuery,
  useGetPaymentDetailsQuery,
  useGetAllSettlementsQuery,
  useGetVendorSettlementsQuery,
  useGetPayoutHistoryQuery,
  useTriggerPayoutMutation,
  useGetAllDisputesQuery,
  useGetDisputeDetailsQuery,
  useResolveDisputeMutation,
  useAdminGetAllNotificationsQuery,
  useGetAdminSystemNotificationsQuery,
  useAdminMarkNotificationAsReadMutation,
  useAdminMarkAllNotificationsAsReadMutation,
  useCreateNotificationMutation,
  usePublishNotificationMutation,
  useGetNotificationDetailsQuery,
  useDeleteSystemNotificationMutation,
  useDeleteInboxNotificationMutation,
  useAdminGetNotificationStatsQuery,
  useGetAllWithdrawalsQuery,
  useGetWithdrawalDetailQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
  useGetWalletStatsQuery,
  useGetWalletTransactionsQuery,
  useAdminRequestWithdrawalMutation,
  useGetAdminPaymentSettingsQuery,
  useUpdateAdminPaymentSettingsMutation,
  useChangePaymentPinMutation,
  useForgotPaymentPinMutation,
  useGetSettlementSummaryQuery,
  useGetBanksQuery,
  useVerifyBankAccountMutation,
  useGetAdminRefundsQuery,
  useProcessAdminRefundMutation,
  useGetLedgerQuery,
  useGetLedgerSummaryQuery,
  useGetFailedPaymentsQuery,
} = adminApi;
