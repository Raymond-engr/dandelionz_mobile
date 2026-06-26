4. Are "Product Rejected" Notifications Clickable?
Verdict: Correctly non-clickable — no change needed
Both platforms only show an action link when action_url is non-null. System-generated notifications like "product rejected" are created by the backend via notification_helpers.py with action_url=None or action_url='', so no clickable link appears. The notification card itself being tappable only to mark it as read is correct behaviour. Leave it as is.

5. Admin Processing/Completing Pending Payments
Verdict: You're right to want this disabled
A payment in pending status means the Paystack webhook hasn't confirmed it yet — likely a failed or incomplete checkout. Allowing admin to manually flip it to payment_confirmed would create a ghost payment in your system with no real money moving.
The updateOrderStatus mutation (PATCH /user/admin/orders/{order_id}/) currently allows changing any field including payment_status. You should remove the "Mark Payment Confirmed" option from the admin UI wherever it appears — it should only ever be set by the Paystack webhook.
In any admin order detail page where you render a dropdown or button for payment status — guard it:
tsx// Example: only show payment status actions if payment_status is NOT 'pending'
{order.payment_status !== 'pending' && (
  <button onClick={() => handleUpdatePaymentStatus(...)}>
    Update Payment Status
  </button>
)}

// Or: explicitly disable the 'payment_confirmed' option in the dropdown
const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', disabled: true },       // read-only
  { value: 'payment_confirmed', label: 'Confirmed', disabled: true }, // webhook only
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];
Apply the same logic consistently on the mobile admin order detail page.

6. Admin Notification Save as Draft
Verdict: Works on both platforms ✓
Backend: AdminNotificationViewSet.create() properly accepts and stores is_draft=True. The draft filter (?is_draft=true) works in list_notifications. ✓
Mobile (app/(admin)/account/notifications/create.tsx): handleSave(isDraft) passes is_draft: isDraft correctly. "Save as Draft" button calls handleSave(true). The index page loads and filters drafts, and shows a Publish button for draft items. ✓
Web (app/admin/account/notifications/create/page.tsx): Has a save-draft path that passes is_draft: true, and the notifications list page has a Draft filter tab. ✓
One sync issue: The web create page doesn't have a scheduling UI (no scheduled_for field), while mobile does. Both should ideally support scheduling. Not blocking, but worth unifying.

7. System Notifications — Hiding the Delete Button
Verdict: The backend has no is_system flag — use category as the identifier
The delete_notification service method works fine (soft-delete) and IsNotificationOwner passes since each user gets their own notification object. The problem is the frontend showing a delete button for notifications that conceptually shouldn't be user-deletable (order updates, payment events, product approvals — i.e., backend-generated events).
The backend uses these categories in notification_helpers.py for system events:
'order', 'product', 'payment', 'delivery', 'general'
Admin-broadcast notifications have an empty category or whatever the admin types in.
Recommended approach — define system categories and gate the delete button:
ts// lib/utils.ts (add to both web and mobile)
export const SYSTEM_NOTIFICATION_CATEGORIES = [
  'order', 'product', 'payment', 'delivery', 'general',
  'vendor_approval', 'product_rejection', 'order_update',
];

export function isSystemNotification(notification: { category?: string }): boolean {
  return SYSTEM_NOTIFICATION_CATEGORIES.includes(notification.category || '');
}
Mobile — app/vendor/account/notifications.tsx:
tsximport { isSystemNotification } from '@/lib/utils';

// In renderItem:
{!isSystemNotification(item) && (
  <TouchableOpacity onPress={() => handleDelete(item.id)}>
    <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
  </TouchableOpacity>
)}
Web — app/vendor/account/notifications/page.tsx:
tsximport { isSystemNotification } from '@/lib/utils'; // or define locally

// In the notifications.map():
{!isSystemNotification(notification) && (
  <button
    onClick={(e) => handleDeleteClick(e, notification.id)}
    className="..."
  >
    <Trash2 className="w-4 h-4" />
  </button>
)}
Apply the same guard to the admin inbox tab in both platforms as well. The admin's "Sent (System)" tab already has a separate delete handler which is fine to keep — those are admin-managed broadcasts.
Better long-term fix: Ask the backend to add is_system: bool to the Notification model and expose it in the serializer. Set it True for all backend-generated events. That removes the need for a category whitelist.

8. Admin Product Search Icon — Mobile
Verdict: Search icon is a dead button — not connected to the search input
The search state, filteredProducts, and filteredCategories are all properly wired. The problem is the search icon TouchableOpacity in the header has no onPress and there's no TextInput to type in.
No backend changes needed — filtering happens client-side on already-fetched data.
Mobile — app/(admin)/(tabs)/product.tsx:
Add a showSearch state and toggle it with the icon, showing a TextInput:
tsxconst [showSearch, setShowSearch] = useState(false);

// In header — add onPress to the search icon:
<TouchableOpacity
  onPress={() => {
    setShowSearch((v) => !v);
    if (showSearch) setSearch(''); // clear on close
  }}
  className="w-10 h-10 items-center justify-center bg-[#F5F7FA] rounded-full"
>
  <Feather name={showSearch ? 'x' : 'search'} size={20} color="#030482" />
</TouchableOpacity>

// Add this below the header View, before the Divider:
{showSearch && (
  <View className="px-[21px] pb-3">
    <TextInput
      autoFocus
      value={search}
      onChangeText={setSearch}
      placeholder={activeTab === 'products' ? 'Search products...' : 'Search categories...'}
      className="bg-[#F5F7FA] px-4 py-3 rounded-xl text-[14px] text-system-blue-dark"
    />
  </View>
)}
Web: The web doesn't appear to have a dedicated admin products tab page yet, so this is mobile-specific for now.

9. Admin Withdraw — Bank Account vs Paystack Account
Verdict: Goes to registered bank account, not Paystack balance — and the vendor flow works end-to-end
Vendor withdrawal flow (confirmed working):

Vendor requests → PayoutService.create_withdrawal_request(auto_process=True) → creates PayoutRequest with status 'processing', debits wallet, notifies admins.
Admin approves it → approve_withdrawal endpoint → calls Paystack Transfer API → money moves to vendor's bank account (stored in VendorProfile.bank_name/account_number/recipient_code).

Admin's own withdrawal flow (has a gap):

Admin requests → AdminWalletViewSet.withdraw() → creates PayoutRequest in 'pending' status, debits wallet.
Nobody approves it automatically. The same admin (or another admin) would need to use the approve_withdrawal endpoint at /admin/finance/withdrawals/approve/. This feels circular — you're deducting the wallet balance but the money won't move to the bank until someone approves.

Recommendation: Either trigger the Paystack transfer directly inside AdminWalletViewSet.withdraw() (since PIN verification already happened), or add an auto-approve hook when the request creator is an admin. Ask the backend dev to look at this — for now the wallet balance is debited but the bank transfer doesn't automatically happen for admin self-withdrawals.
Both flows target the registered bank account (vendor's recipient_code, admin's AdminPayoutProfile.recipient_code), not a Paystack wallet/balance.

Quick Sync Checklist
IssueWebMobileBackendSave Draft product✅ works (add explicit publish_status)✅ works (add explicit publish_status)✅Eye icon removeFix vendor + admin pagesFix vendor + admin screens—Double ₦✅ cleanFix vendor + admin withdraw—Notification clickability✅ correct already✅ correct already—Admin completing pending paymentDisable button in order detailDisable button in order detailConsider blocking at API level tooNotification save draft✅ works✅ works✅System notification deleteAdd isSystemNotification() guardAdd isSystemNotification() guardIdeally add is_system fieldAdmin product searchN/A (no admin product page yet)Wire icon to show TextInput—Admin withdraw destination——Admin self-withdrawal needs auto-process or Paystack call