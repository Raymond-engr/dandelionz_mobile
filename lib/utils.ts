import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: string | number | undefined | null,
): string {
  const value = parseFloat(String(amount || "0"));
  return `₦${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "https://api.dandelionz.com.ng";
  // Ensure we don't have double slashes
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
}

export function resolveNotificationUrl(
  url: string | null | undefined,
  role: string,
): string {
  if (!url) return "#";

  // Strip domain if present (e.g. https://api.dandelionz.com.ng/...)
  let path = url;
  try {
    if (url.startsWith("http")) {
      const urlObj = new URL(url);
      path = urlObj.pathname + urlObj.search;
    }
  } catch (e) {
    // If invalid URL, keep original string
    console.warn("Invalid URL in resolveNotificationUrl", e);
  }

  // Ensure path starts with /
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  // Logic for Vendor
  if (role === "vendor") {
    // Check if it's an order detail path (from backend /transactions/orders/UUID/ or frontend /orders/UUID)
    // We want to map it to /vendor/orders/UUID
    const orderMatch = path.match(
      /\/(?:transactions\/orders|orders)\/([a-zA-Z0-9-]+)/,
    );
    if (orderMatch) {
      return `/vendor/order/${orderMatch[1]}`;
    }

    // Vendor Products: Detail page might not exist (only edit), redirect to list for safety
    if (path.includes("/product/") || path === "/product") {
      return "/vendor/product";
    }

    // Map web-style account routes to mobile-style vendor account routes
    if (path.startsWith("/account/")) {
      const subPath = path.replace("/account/", "").replace(/\/$/, "");
      if (subPath === "faqs") return "/vendor/account/vendor-faqs";
      if (subPath === "terms") return "/vendor/account/vendor-terms";
      return `/vendor/account/${subPath}`;
    }

    // Ensure vendor prefix if missing for other known vendor routes
    if (!path.startsWith("/vendor")) {
      // dashboard maps to root vendor
      if (path === "/dashboard" || path === "/dashboard/") {
        return "/vendor";
      }

      const vendorRoutes = ["wallet", "settings"];
      const cleanPath = path.replace(/^\//, "");
      const firstSegment = cleanPath.split("/")[0];

      if (vendorRoutes.includes(firstSegment)) {
        return `/vendor/${cleanPath}`;
      }
    }
  }

  // Logic for Customer
  if (role === "customer") {
    // Orders & Receipt priority
    if (path.includes("/receipt") || path.includes("/order-tracking")) {
      // Use existing ID matching logic below or return path as is if already formatted
    }

    // Order detail mapping (must be before general transaction check)
    // Map /orders/UUID, /receipt?id=UUID, /order-tracking?id=UUID, /payments/UUID or /transactions/orders/UUID to /order-receipt?id=UUID
    const orderMatch = path.match(
      /\/(?:transactions\/orders|orders|receipt|order-tracking|payments)\/([a-zA-Z0-9-]+)/,
    );
    if (orderMatch) {
      return `/order-receipt?id=${orderMatch[1]}`;
    }

    // Handle query parameter style /receipt?id=... or /order-tracking?id=...
    if (path.includes("id=")) {
      const idMatch = path.match(/id=([a-zA-Z0-9-]+)/);
      if (idMatch) {
        if (path.includes("/order-tracking")) {
          return `/order-tracking?id=${idMatch[1]}`;
        }
        return `/order-receipt?id=${idMatch[1]}`;
      }
    }

    // If it's a generic order tracking or receipt link without ID, go to tracking search
    if (path.startsWith("/order-tracking")) {
      return "/order-tracking";
    }
    if (path.startsWith("/receipt")) {
      return "/(tabs)/orders"; // Use correct tab path
    }

    // If backend sends payment or transaction links (not specifically for an order UUID), 
    // redirect to orders list as we can't reliably resolve transaction ID to order ID on frontend
    if (path.includes("/transactions/") || path.includes("/payments/") || path.includes("/payment/")) {
      return "/(tabs)/orders"; // Use correct tab path
    }

    // Map common customer routes
    const cleanPath = path.replace(/\/$/, "");
    if (cleanPath === "/dashboard") return "/";
    if (cleanPath === "/account/notifications") return "/customer-notifications";
    if (cleanPath === "/account/profile") return "/customer-profile";
    if (cleanPath === "/account/change-password") return "/change-password";
    if (cleanPath === "/account/orders" || cleanPath === "/orders") return "/(tabs)/orders"; // Use correct tab path
    if (cleanPath === "/account/faqs") return "/faqs";
    if (cleanPath === "/account/terms") return "/terms";

    // Products: /product/slug is valid in mobile as is
    
    // If backend sends /admin/... or /vendor/... to a customer, redirect to home or safe page
    if (path.startsWith("/admin") || path.startsWith("/vendor")) {
      return "/";
    }
  }

  // Logic for Admin
  if (role === "admin" || role === "BUSINESS_ADMIN") {
    const orderMatch = path.match(
      /\/(?:transactions\/orders|orders)\/([a-zA-Z0-9-]+)/,
    );
    if (orderMatch) {
      return `/(admin)/orders/${orderMatch[1]}`;
    }

    if (path === "/dashboard" || path === "/dashboard/") return "/(admin)/(tabs)";
    
    if (path.startsWith("/account/")) {
      const subPath = path.replace("/account/", "").replace(/\/$/, "");
      if (subPath === "faqs") return "/(admin)/account/admin-faqs";
      if (subPath === "notifications") return "/(admin)/account/notifications";
      return `/(admin)/account/${subPath}`;
    }
  }

  return path;
}

export const SYSTEM_NOTIFICATION_CATEGORIES = [
  'order', 'product', 'payment', 'delivery', 'general',
  'vendor_approval', 'product_rejection', 'order_update',
];

export function isSystemNotification(notification: { category?: string }): boolean {
  return SYSTEM_NOTIFICATION_CATEGORIES.includes(notification?.category || '');
}
