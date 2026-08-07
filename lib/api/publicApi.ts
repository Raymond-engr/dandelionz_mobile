import { baseApi } from "./baseApi";

export interface ProductImage {
  id: number;
  image: string;
  image_url: string;
  is_main: boolean;
  alt_text?: string | null;
  variant_association?: any;
  display_order: number;
  uploaded_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id?: number; // Optional in case it's not strictly passed as flat id
  product: {
    id: number;
    name: string;
    price: string;
    image?: string;
    description?: string;
    tags?: string;
    brand?: string;
    variants?: any[];
    discount?: number;
  };
  quantity: number;
  price_at_purchase?: string;
  item_subtotal: number;
}

export interface OrderTimeline {
  status: string;
  label: string;
  timestamp: string;
  description?: string;
  completed: boolean;
}

export interface Order {
  id: number;
  order_id: string;
  customer: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total_price: string;
  delivery_fee: string;
  /** Whether the delivery fee has been settled. Only meaningful when delivery_fee > 0. */
  delivery_fee_paid: boolean;
  /** Start of the promised delivery window (ISO), or null until an admin schedules it. */
  expected_delivery_earliest: string | null;
  /** End of the promised delivery window (ISO), or null until an admin schedules it. */
  expected_delivery_latest: string | null;
  discount: string;
  total_with_delivery: string;
  is_delivered: boolean;
  ordered_at: string;
  created_at?: string;
  tracking_number?: string;
  shipping_address?: {
    full_name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    phone_number?: string;
  };
  order_items?: OrderItem[];
  timeline?: OrderTimeline[];
  items_count?: number;
  installment_plan?: any;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  rating?: number;
  image?: string | null;
  images?: ProductImage[];
  slug?: string;
  store?: number;
  store_name?: string;
  vendor?: {
    id: number;
    store_name: string;
    email_address: string;
    vendor_status: string;
    store_description: string;
    address: string;
  };
  vendorName?: string;
  description?: string;
  category?: string;
  category_name?: string;
  discounted_price?: string;
  discount?: number; // Added discount percentage
  stock?: number;
  brand?: string;
  tags?: string;
  variants?: any[];
  videos?: any[];
  in_stock?: boolean;
  approval_status?: string;
  uploaded_date?: string;
  created_at?: string;
  updated_at?: string;
  reviews?: any[];
}

export interface InstallmentPayment {
  id: number;
  payment_number: number;
  amount: string;
  status: "PAID" | "PENDING" | "FAILED";
  due_date: string;
  payment_date: string | null;
  reference: string;
  gateway: string;
  paid_at: string | null;
  verified: boolean;
  created_at: string;
  is_overdue: boolean;
}

export interface InstallmentPlan {
  id: number;
  order_id: string;
  duration: string;
  total_amount: string;
  installment_amount: string;
  number_of_installments: number;
  paid_installments_count: number;
  pending_installments_count: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "DEFAULTED";
  is_fully_paid: boolean;
  start_date: string;
  created_at: string;
  updated_at: string;
  // Running-balance ("CDcare") model. The plan is paid down flexibly rather than
  // on a fixed per-row schedule, so these drive the pay panel.
  /** How much of the plan has been settled so far. */
  amount_paid: number;
  /** What is still owed on the plan. Card/wallet payments are capped to this. */
  balance_remaining: number;
  /** Progress as a fraction 0..1 (amount_paid / total_amount). */
  paid_fraction: number;
  /** Smallest payment accepted right now; 0 when nothing is due yet. */
  minimum_due_now: number;
  /** When the next payment is expected, or null when the plan is settled. */
  next_due_date: string | null;
  /** Advisory schedule rows: kept for reference, no longer paid individually. */
  installments?: InstallmentPayment[];
}

export interface CartItem {
  id: number;
  product: number;
  product_details: Product;
  quantity: number;
  selected_variants: Record<string, string>;
  subtotal: string;
}

export interface Cart {
  id: number;
  customer: string;
  items: CartItem[];
  total: string;
  created_at: string;
  updated_at: string;
}

type GetProductsResponse = {
  success: boolean;
  data: Product[];
};

export type SearchSuggestion = {
  name: string;
  slug: string;
};

type SearchSuggestionsResponse = {
  success: boolean;
  data: {
    products: SearchSuggestion[];
    categories: SearchSuggestion[];
  };
};

/** Which feed the recommendation endpoint should build. */
export type RecommendationType = "related" | "for-you" | "trending";

export type RecommendationArgs = {
  type: RecommendationType;
  /** Product slug to find neighbours for. Only meaningful for `related`. */
  product?: string;
  /** Category slug to scope to. Only meaningful for `trending`. */
  category?: string;
  limit?: number;
};

/** Same envelope and item shape as /store/products/. */
type GetRecommendationsResponse = {
  success: boolean;
  data: Product[];
};

/** Signals the recommender learns from. Deliberately a closed set. */
export type InteractionEventType = "view" | "cart_add";

export type InteractionArgs = {
  /** Product slug, not id — matches the rest of the store API. */
  product: string;
  event_type: InteractionEventType;
};

// Public/Store API (no auth required)
export const publicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query<
      GetProductsResponse,
      {
        category?: string;
        search?: string;
        page?: number;
        store?: string;
        min_price?: number;
        max_price?: number;
        price?: number; // for exact price match
        ordering?: string;
      }
    >({
      query: (params) => ({
        url: "/store/products/",
        params,
      }),
      providesTags: ["Product"],
    }),

    getProductBySlug: builder.query<
      { success: boolean; data: Product },
      string
    >({
      query: (slug) => `/store/products/${slug}/`,
      providesTags: ["Product"],
    }),

    getSearchSuggestions: builder.query<SearchSuggestionsResponse, string>({
      query: (q) => ({
        url: "/store/products/suggestions/",
        params: { q },
      }),
      // Deliberately untagged: suggestions are a transient typeahead aid, and
      // invalidating them on every product mutation would refetch constantly.
    }),

    // Recommendations
    getRecommendations: builder.query<
      GetRecommendationsResponse,
      RecommendationArgs
    >({
      query: (params) => ({
        url: "/store/recommendations/",
        params,
      }),
      // Deliberately untagged, like suggestions: these feeds are advisory and
      // re-ranked server-side, so invalidating them on every product or cart
      // mutation would refetch three rows for no visible benefit.
    }),

    recordInteraction: builder.mutation<void, InteractionArgs>({
      query: (body) => ({
        url: "/store/events/",
        method: "POST",
        body,
      }),
      // No invalidation: this is a write-only signal. The 202 carries no body
      // and nothing on screen depends on it.
    }),

    // Categories
    getCategories: builder.query<any[], void>({
      query: () => "/store/categories/",
      providesTags: ["Category"],
    }),

    // Cart (requires auth)
    getCart: builder.query<{ success: boolean; data: Cart }, void>({
      query: () => "/store/cart/",
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<
      { success: boolean; data: CartItem; message?: string },
      {
        slug: string;
        quantity: number;
        selected_variants?: Record<string, string>;
      }
    >({
      query: (body) => ({
        url: "/store/cart/add/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    removeFromCart: builder.mutation<
      { success: boolean; message: string },
      { slug: string; selected_variants?: Record<string, string> }
    >({
      query: ({ slug, selected_variants }) => {
        let url = `/store/cart/remove/${slug}/`;
        if (selected_variants && Object.keys(selected_variants).length > 0) {
          const variantsJson = JSON.stringify(selected_variants);
          url += `?selected_variants=${encodeURIComponent(variantsJson)}`;
        }
        return {
          url,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Cart"],
    }),

    updateCartItem: builder.mutation<
      { success: boolean; data?: CartItem; message: string },
      {
        slug: string;
        quantity: number;
        selected_variants?: Record<string, string>;
      }
    >({
      query: (body) => ({
        url: "/store/cart/update/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Wishlist
    getWishlist: builder.query<any[], void>({
      query: () => "/store/favourites/",
      providesTags: ["Wishlist"],
    }),

    addToWishlist: builder.mutation<
      { success: boolean; message: string },
      { slug: string }
    >({
      query: (body) => ({
        url: "/store/favourites/add/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlist"],
    }),

    removeFromWishlist: builder.mutation<
      { success: boolean; message: string },
      string // slug
    >({
      query: (slug) => ({
        url: `/store/favourites/remove/${slug}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    // Orders
    getCustomerOrders: builder.query<Order[], { status?: string }>({
      query: (params) => ({
        url: "/transactions/orders/",
        params,
      }),
      providesTags: ["Order"],
    }),

    createOrder: builder.mutation<{ success: boolean; data: any }, any>({
      query: (body) => ({
        url: "/transactions/orders/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order", "Cart"],
    }),

    getCustomerOrderDetails: builder.query<Order, string>({
      query: (uuid) => `/transactions/orders/${uuid}/`,
      providesTags: ["Order"],
    }),

    getOrderReceipt: builder.query<{ success: boolean; data: any }, string>({
      query: (uuid) => `/transactions/orders/${uuid}/receipt/`,
      providesTags: ["Order"],
    }),

    payForOrder: builder.mutation<
      { success: boolean; data: any },
      { uuid: string; payment_method: string }
    >({
      query: ({ uuid, ...body }) => ({
        url: `/transactions/orders/${uuid}/pay/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order", "Payment"],
    }),

    cancelOrder: builder.mutation<
      { success: boolean; data: { order_id: string; status: string; refund_pending: boolean }; message: string },
      string // order_id
    >({
      query: (order_id) => ({
        url: `/transactions/orders/${order_id}/cancel/`,
        method: 'POST',
      }),
      invalidatesTags: ['Order'],
    }),

    // Reviews
    addProductReview: builder.mutation<
      { success: boolean; data: any },
      { slug: string; rating: number; comment: string }
    >({
      query: ({ slug, ...body }) => ({
        url: `/store/products/${slug}/review/add/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    getProductReviews: builder.query<any[], string>({
      query: (slug) => `/store/products/${slug}/reviews/`,
      providesTags: ["Product"],
    }),

    // Payments
    initializeCheckout: builder.mutation<
      {
        success: boolean;
        data: {
          order_id: string;
          /** The card leg only. On a split payment this is less than total_amount. */
          amount: number;
          reference: string;
          /** Null when the wallet covered the whole order and there is no card leg. */
          authorization_url: string | null;
          access_code?: string;
          /** How much of the order the wallet paid. */
          wallet_amount: number;
          total_amount: number;
          /**
           * False when the wallet covered everything. The client must then skip the
           * payment WebView entirely — the order is already paid.
           */
          requires_payment: boolean;
          delivery_fee: number;
        };
        message: string;
      },
      { use_wallet?: boolean; wallet_amount?: number } | void
    >({
      query: (body) => ({
        url: "/transactions/checkout/",
        method: "POST",
        body: body || {},
      }),
      // The wallet is debited when checkout starts, not when the card leg lands, so the
      // balance has really changed by the time this returns.
      invalidatesTags: ["Cart", "Order", "CustomerWallet"],
    }),

    initializeInstallmentCheckout: builder.mutation<
      {
        success: boolean;
        data: {
          order_id: string;
          installment_plan_id: number;
          duration: string;
          total_amount: number;
          number_of_installments: number;
          installment_amount: number;
          first_installment_reference: string;
          authorization_url: string;
          delivery_fee: number;
        };
        message: string;
      },
      { duration: string; amount?: number }
    >({
      query: (body) => ({
        url: "/transactions/checkout/installment/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart", "Order"],
    }),

    // Delivery-fee payment. Billed after an admin schedules the delivery window; the
    // wallet can cover part or all of it, mirroring order checkout.
    initDeliveryPayment: builder.mutation<
      {
        success: boolean;
        data: {
          /** False when the wallet covered the whole fee — the order is already paid. */
          requires_payment: boolean;
          /** Present only when a card leg is needed. */
          authorization_url?: string;
          reference: string;
          wallet_amount: number;
          card_amount: number;
          order_id: string;
        };
        message?: string;
      },
      { order_id: string; use_wallet: boolean; wallet_amount?: number }
    >({
      query: ({ order_id, ...body }) => ({
        url: `/transactions/orders/${order_id}/delivery-payment/`,
        method: "POST",
        body,
      }),
      // The wallet is debited when the payment starts, so its balance has changed by
      // the time this returns.
      invalidatesTags: ["Order", "CustomerWallet"],
    }),

    verifyDeliveryPayment: builder.query<
      {
        success: boolean;
        message?: string;
        data: {
          reference: string;
          status: string;
          order_id: string;
          delivery_fee_paid: boolean;
        };
      },
      { reference: string }
    >({
      query: ({ reference }) => ({
        url: `/transactions/verify-delivery-payment/?reference=${encodeURIComponent(reference)}`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    verifyPayment: builder.query<
      {
        status: string;
        message: string;
        data: {
          amount: string;
          reference: string;
          status: string;
          paid_at: string;
        };
      },
      { reference: string }
    >({
      query: ({ reference }) => ({
        url: `/transactions/verify-payment/?reference=${reference}`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    verifyInstallmentPayment: builder.query<
      {
        success: boolean;
        message: string;
        data: InstallmentPayment;
      },
      { reference: string }
    >({
      query: ({ reference }) => ({
        url: `/transactions/verify-installment-payment/?reference=${reference}`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    // Pay down an installment plan's running balance. Send an explicit `amount`,
    // or omit it and set `clear_balance` to settle the whole balance in one go.
    // `use_wallet` lets the spendable wallet cover part or all of the payment,
    // mirroring order checkout. requires_payment=false means the wallet settled
    // it and no card leg is needed; otherwise open authorization_url in the
    // checkout WebView (the INS- reference routes to installment verify).
    payInstallment: builder.mutation<
      {
        success: boolean;
        data: {
          /** False when the wallet covered the payment — nothing left to charge. */
          requires_payment: boolean;
          /** Present only when a card leg is needed. */
          authorization_url?: string;
          reference: string;
          method: "WALLET" | "CARD";
          amount: number;
          plan_id: number;
          order_id: string;
        };
        message?: string;
      },
      {
        plan_id: number;
        amount?: number;
        clear_balance?: boolean;
        use_wallet?: boolean;
      }
    >({
      query: (body) => ({
        url: "/transactions/installment-plans/init-payment/",
        method: "POST",
        body,
      }),
      // The wallet may be debited immediately, so its balance can change here.
      invalidatesTags: ["Order", "CustomerWallet"],
    }),

    getInstallmentPlans: builder.query<
      { success: boolean; data: InstallmentPlan[] },
      void
    >({
      query: () => "/transactions/installment-plans/",
      providesTags: ["Order"],
    }),

    getInstallmentPlanDetails: builder.query<
      { success: boolean; data: InstallmentPlan },
      number
    >({
      query: (id) => `/transactions/installment-plans/${id}/`,
      providesTags: ["Order"],
    }),

    getInstallmentPayments: builder.query<
      { success: boolean; data: InstallmentPayment[] },
      number
    >({
      query: (plan_id) =>
        `/transactions/installment-plans/${plan_id}/payments/`,
      providesTags: ["Order"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetSearchSuggestionsQuery,
  useGetRecommendationsQuery,
  useRecordInteractionMutation,
  useGetCategoriesQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetCustomerOrdersQuery,
  useCreateOrderMutation,
  useGetCustomerOrderDetailsQuery,
  useGetOrderReceiptQuery,
  usePayForOrderMutation,
  useCancelOrderMutation,
  useAddProductReviewMutation,
  useGetProductReviewsQuery,
  useInitializeCheckoutMutation,
  useInitializeInstallmentCheckoutMutation,
  useInitDeliveryPaymentMutation,
  useVerifyDeliveryPaymentQuery,
  useLazyVerifyDeliveryPaymentQuery,
  useVerifyPaymentQuery,
  useLazyVerifyPaymentQuery,
  useVerifyInstallmentPaymentQuery,
  useLazyVerifyInstallmentPaymentQuery,
  usePayInstallmentMutation,
  useGetInstallmentPlansQuery,
  useGetInstallmentPlanDetailsQuery,
  useGetInstallmentPaymentsQuery,
} = publicApi;
