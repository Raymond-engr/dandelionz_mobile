# Dandelionz Mobile 🌼

Dandelionz is a comprehensive multi-role marketplace application built with Expo and React Native. It serves a diverse ecosystem of Customers, Vendors, and Administrators, providing a seamless shopping, selling, and management experience.

## 🚀 Key Features

### 👤 Customer Experience
- **Smart Shopping:** Browse categories, search products, and manage a personalized wishlist.
- **Flexible Checkout:** Support for both standard payments and installment plans.
- **Order Management:** Real-time order tracking and digital e-receipts.
- **Profile & Security:** Manage delivery addresses, change passwords, and handle account notifications.

### 🏪 Vendor Portal
- **Inventory Management:** Full CRUD operations for products with approval workflows.
- **Sales Analytics:** Track orders and monitor business performance.
- **Digital Wallet:** Secure withdrawal system with PIN protection and transaction history.
- **Communication:** Integrated notification system for order updates and platform news.

### 🛡️ Admin Dashboard
- **Platform Oversight:** Monitor total users, vendors, and marketplace health.
- **Approval System:** Review and approve/reject new products and vendor applications.
- **Financial Management:** Oversee settlements and process withdrawal requests.
- **User Management:** Detailed profiles for both customers and vendors.

---

## 🛠 Tech Stack

- **Framework:** [Expo](https://expo.dev) (SDK 54) with [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) with RTK Query for API interactions
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Navigation:** Expo Router (Stack & Tab navigation)
- **Storage:** [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) & [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/secure-store/)
- **Notifications:** [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) & [Toast Message](https://github.com/calintamas/react-native-toast-message)
- **Networking:** Axios-based API client with authentication interceptors

---

## 📂 Project Structure

```text
├── app/                  # Expo Router directory (File-based routes)
│   ├── (admin)/          # Admin-only dashboard and management screens
│   ├── (auth)/           # Authentication flow (Login, Register, Password Reset)
│   ├── (tabs)/           # Main Customer tab navigation (Shop, Cart, Orders, etc.)
│   ├── vendor/           # Vendor-specific portal and wallet management
│   └── checkout/         # Synchronized multi-step checkout flow
├── components/           # Reusable UI components and skeletons
├── constants/            # Theme, Colors, and configuration constants
├── hooks/                # Custom React hooks (Theme, Color Scheme)
├── lib/                  # Core logic, Redux store, and API services
│   ├── api/              # Role-specific API definitions (RTK Query)
│   ├── features/         # Redux slices (Auth, Notifications)
│   └── utils.ts          # Helper functions and formatters
└── assets/               # Branding, Icons, and local images
```

---

## 🏁 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app (for physical device testing)

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root (if required by your API configuration) and add the necessary environment variables:
```env
EXPO_PUBLIC_API_URL=https://api.dandelionz.com.ng
```

### 4. Running the Project
```bash
# Start the Expo development server
npx expo start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

---

## 🔒 Security & Architecture
- **Role-Based Access Control (RBAC):** Screens and layouts are protected based on the user's role (CUSTOMER, VENDOR, ADMIN).
- **Persistent Auth:** Session state is persisted securely using a combination of Redux and AsyncStorage.
- **Deep Linking:** Configured for `dandelionz://` and `app.dandelionz.com.ng` to handle verification emails and push notification redirects.
- **Navigation Safety:** Uses `freezeOnBlur` and `popToTop` patterns to prevent background re-renders and navigation stack bloat.

## 📄 License
This project is private and proprietary.
