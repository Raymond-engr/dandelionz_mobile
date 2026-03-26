The Redux and API layers are identical, making logic replication straightforward. I've identified missing pages and design alignment needs for the mobile app, including centered headers, 11px dividers, and specific button styling. I'll now audit global components, align the  
 authentication flow, and systematically refactor the customer, admin, and vendor flows to match the Figma designs. I'll finish by checking the current login page in the mobile app against the design specs.
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮  
│ ✓ ReadFile app\(auth)\login.tsx │  
│ │  
╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯  
✦ I've analyzed the login.tsx file and determined it needs a refactor to use NativeWind and specific design tokens like #030482 to align  
 with the project's goals. I now have all the necessary information to provide the requested analysis and the master replication prompt.

Analysis: Dandelionz Web vs. Mobile

Current State Comparison

1. Architectural Parity

- API & Redux: Both projects share identical API slices (lib/api/\*.ts) and Redux store configurations. This means business logic, data  
  fetching, and state management are 100% consistent.
- Styling Tech: The Web app uses Tailwind CSS. The Mobile app uses NativeWind v4, which allows for a direct translation of Tailwind  
  classes into React Native styles.
- Structure: Both use directory-based routing (Next.js App Router for Web, Expo Router for Mobile).

2. Functional & Page Gaps
   The following features/pages are present in the Web version but missing or incomplete in Mobile:

- Full Checkout Flow: Web has a multi-step checkout (Payment Frequency -> Installments -> Shipping Details -> Payment Mode). Mobile  
  currently stops at cart.tsx.
- Order Tracking: A dedicated page for tracking active orders is missing in Mobile.
- Receipts & Success States: Post-action confirmation screens (Receipts, PIN success, Registration success) in Mobile need to be aligned
  with success-standards.md.
- Admin/Vendor Sub-pages: While the core dashboard pages exist, detailed list views (Users, Vendors, Category Edit) in the Admin/Vendor
  sections are less developed in Mobile.

3. Disconnected Flows

- Cart to Checkout: The "Proceed" button in the Mobile cart needs to initiate the multi-step checkout sequence.
- Account Links: Some navigation links in account.tsx and the Vendor/Admin dashboards are either missing or point to unstyled
  placeholders.
- Success Redirection: Several forms (Login, Register, Wallet) need updated redirection logic to match the Web's flow.

---

Replication Strategy & Key Considerations

1. Global Component Alignment
   Before page-by-page replication, the following global components must be standardized in Mobile:

- Button: Standardize components/Button.tsx to exactly h-[55px] with rounded-[12px].
- Divider: Implement a Divider component that renders an 11px high strip of #F5F7FA for logical section breaks.
- Input: Standardize text inputs to use the underlined style with specific font sizes (16px) defined in login.md.

2. Design Tokens (NativeWind)
   Strictly use the following tokens mapped in tailwind.config.js:

- Primary: system-blue-light (#030482)
- Text: system-blue-dark (#000011)
- Separators: system-divider (#F5F7FA)
- Radius: rounded-[12px] (Buttons/Cards) and rounded-[50px] (Pills).

3. Mobile-Specific Nuances

- Keyboard Handling: Ensure KeyboardAvoidingView is used in all form pages (Login, Checkout, PIN).
- Safe Areas: Wrap all root screens in SafeAreaView (from react-native-safe-area-context) to avoid notch/home-indicator overlaps.
- Touch Targets: Maintain the 44x44px standard, specifically for the 21px padded list items.
- Navigation: Use expo-router's useRouter() and <Link /> for all transitions.

---

Replication Master Prompt

I have drafted a master prompt that can be used to execute the replication of the Web version into the Mobile version.

    1 # Master Replication Prompt: Web-to-Mobile Alignment
    2
    3 ## Objective
    4 Replicate the design and functionality of the Dandelionz Web App (`Dandelionz_App`) in the Dandelionz Mobile App
      (`Dandelionz_Mobile`). Ensure pixel-perfect alignment with the specifications in the `design/*.md` folder while preserving the
      existing Redux/API logic.
    5
    6 ## Strategic Context
    7 - **Tech Stack:** Translate Next.js/Tailwind components to Expo/NativeWind.
    8 - **Core Design Rules:**
    9   - Titles: 24px Semi-Bold, Centered, `#000011`.

10 - Buttons: 55px Height, 12px Radius, `#030482`.
11 - Dividers: 11px Height, `#F5F7FA`.
12 - Padding: 21px horizontal for list items.
13
14 ## Phase 1: Foundation (Global Components)
15 1. Update `Dandelionz_Mobile/components/Button.tsx` to match the 55px/12px standard.
16 2. Create a `Dandelionz_Mobile/components/ui/Divider.tsx` for the 11px section breaks.
17 3. Verify `tailwind.config.js` in Mobile has all `system-*` colors correctly mapped.
18
19 ## Phase 2: Missing Flow Implementation (Functional Parity)
20 1. **Checkout Flow:** Implement a multi-step checkout sequence in `app/checkout/` matching `checkout.md`. Steps: Frequency,
Installments, Shipping, Payment.
21 2. **Order Tracking:** Create `app/order-tracking.tsx` replicating the Web's tracking UI.
22 3. **Success/Receipts:** Create `app/receipt.tsx` and update all success screens to follow `success-standards.md`.
23
24 ## Phase 3: Page Alignment (Design Refactor)
25 1. **Auth:** Refactor `login.tsx` and `register.tsx` to use NativeWind and match `login.md`/`register.md`.
26 2. **Customer Tabs:** Update `account.tsx`, `orders.tsx`, and `wishlist.tsx` to match their respective design docs. Replace all border dividers with the 11px strip.
27 3. **Admin/Vendor Dashboards:** Apply the `#F5F7FA` full-width background blocks and card specs (h-95px, no borders) defined in  
 `admin-home.md` and `vendor-home.md`.
28
29 ## Phase 4: Quality & Logic Sync
30 1. Ensure all `Pressable` components use appropriate `haptics` (where applicable).
31 2. Validate that the identical API slices are correctly integrated into the new UI components.
32 3. Verify "Back" navigation behavior and stack order in the Expo Router.

I am ready to proceed with creating the implementation plan whenever you are ready. For now, this analysis covers all requested checks.  

29 ## Phase 4: Quality & Logic Sync
   30 1. Ensure all `Pressable` components use appropriate `haptics` (where applicable).
   31 2. Validate that the identical API slices are correctly integrated into the new UI components.
   32 3. Verify "Back" navigation behavior and stack order in the Expo Router.

  I am ready to proceed with creating the implementation plan whenever you are ready. For now, this analysis covers all requested checks.
