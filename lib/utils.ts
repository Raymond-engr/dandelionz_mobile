import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number | undefined | null): string {
  const value = parseFloat(String(amount || "0"));
  return `₦${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function resolveNotificationUrl(url: string | null | undefined, role: string): string {
  if (!url) return '#';

  // Strip domain if present (e.g. https://api.dandelionz.com.ng/...)
  let path = url;
  try {
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      path = urlObj.pathname + urlObj.search;
    }
  } catch (e) {
    // If invalid URL, keep original string
    console.warn('Invalid URL in resolveNotificationUrl', e);
  }

  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Logic for Vendor
  if (role === 'vendor') {
    // Check if it's an order detail path (from backend /transactions/orders/UUID/ or frontend /orders/UUID)
    // We want to map it to /vendor/orders/UUID
    const orderMatch = path.match(/\/(?:transactions\/orders|orders)\/([a-zA-Z0-9-]+)/);
    if (orderMatch) {
      return `/vendor/orders/${orderMatch[1]}`;
    }

    // Vendor Products: Detail page might not exist (only edit), redirect to list for safety
    if (path.includes('/product/') || path === '/product') {
      return '/vendor/product';
    }
    
    // Ensure vendor prefix if missing for other known vendor routes
    if (!path.startsWith('/vendor') && !path.startsWith('/account')) {
       // Check if it's a route that has a vendor equivalent
       const vendorRoutes = ['dashboard', 'wallet', 'settings'];
       const cleanPath = path.replace(/^\//, '');
       const firstSegment = cleanPath.split('/')[0];
       
       if (vendorRoutes.includes(firstSegment)) {
         return `/vendor/${cleanPath}`;
       }
    }
  }

  // Logic for Customer
  if (role === 'customer') {
    // If backend sends payment or transaction links, redirect to orders list as we can't reliably resolve transaction ID to order ID on frontend
    if (path.includes('/transactions/') || path.includes('/payment/')) {
        return '/orders';
    }

    // Orders: /orders/123 is valid
    // Products: /product/slug is valid
    // If backend sends /admin/... or /vendor/... to a customer, redirect to home or safe page
    if (path.startsWith('/admin') || path.startsWith('/vendor')) {
      return '/';
    }
  }

  return path;
}