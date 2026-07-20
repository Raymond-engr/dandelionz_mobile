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
  status: "ACTIVE" | "COMPLETED" | "DEFAULTED";
  is_fully_paid: boolean;
  start_date: string;
  created_at: string;
  updated_at: string;
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
          amount: number;
          reference: string;
          authorization_url: string;
          access_code: string;
        };
        message: string;
      },
      void
    >({
      query: () => ({
        url: "/transactions/checkout/",
        method: "POST",
      }),
      invalidatesTags: ["Cart", "Order"],
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
      { duration: string }
    >({
      query: (body) => ({
        url: "/transactions/checkout/installment/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart", "Order"],
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

    initializeNextInstallment: builder.mutation<
      {
        success: boolean;
        data: {
          authorization_url: string;
          reference: string;
          amount: number;
          payment_number: number;
          installment_plan_id: number;
        };
        message: string;
      },
      { plan_id: number; payment_number: number }
    >({
      query: (body) => ({
        url: "/transactions/installment-plans/init-payment/",
        method: "POST",
        body,
      }),
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
  useVerifyPaymentQuery,
  useLazyVerifyPaymentQuery,
  useVerifyInstallmentPaymentQuery,
  useLazyVerifyInstallmentPaymentQuery,
  useInitializeNextInstallmentMutation,
  useGetInstallmentPlansQuery,
  useGetInstallmentPlanDetailsQuery,
  useGetInstallmentPaymentsQuery,
} = publicApi;
