Now I have everything. Let me compile the full analysis and code.Synthesized findings across installment plans, vendor earnings, suspension handling, and order cancellationSynthesized findings across installment plans, vendor earnings, suspension handling, and order cancellationNow I have everything. Here's the full breakdown:

1. Installment Payment — Current State & Gaps
   What Exists
   Backend fully supports installments end-to-end:

POST /transactions/checkout/installment/ — creates order + plan + charges first installment via Paystack
POST /transactions/installment-plans/init-payment/ — initialises each subsequent installment payment
GET /transactions/installment-plans/ — lists customer's active plans
GET /transactions/installment-plans/{id}/payments/ — lists individual installments with due dates and status
POST /transactions/verify-installment-payment/ — verifies payment after Paystack redirect

Mobile RTK Query hooks for all of the above already exist in lib/api/publicApi.ts:

initializeNextInstallment, getInstallmentPlans, getInstallmentPlanDetails.
Critical Gap — Zero UI for Follow-Up Payments
After the first installment is paid, the customer has absolutely no way to see or pay subsequent installments. The order-receipt.tsx shows no plan info. The order-tracking.tsx shows a status timeline but nothing about upcoming payments. The orders list just shows order status.
The hooks are there — they're just never called from any screen.

Plan: Reduce Max to 8 Months
My suggestion for the new plan set:
PlanLabelInstallmentsMonthly Amount1_month1 Month Plan1Full total3_months3 Months Plan3Total ÷ 36_months6 Months Plan6Total ÷ 68_months8 Months Plan8Total ÷ 8
Simply replace 1_year → 8_months. The progression 1 → 3 → 6 → 8 still makes sense (short, medium, long, max). You don't need to add a "2-month" plan in the middle — the jump from 1 to 3 is fine.

Code: Plan Changes (Backend)
transactions/models.py — InstallmentPlan:
pythonclass InstallmentPlan(models.Model):
class DurationChoice(models.TextChoices):
ONE_MONTH = '1_month', '1 Month'
THREE_MONTHS = '3_months', '3 Months'
SIX_MONTHS = '6_months', '6 Months'
EIGHT_MONTHS = '8_months', '8 Months' # ← replaces ONE_YEAR

    DURATION_INSTALLMENTS = {
        '1_month':   1,
        '3_months':  3,
        '6_months':  6,
        '8_months':  8,   # ← replaces '1_year': 12
    }
    # rest unchanged

Run a migration after this change. Existing orders with duration='1_year' remain valid — they're stored as raw strings, so old records are unaffected.

Code: Plan Changes (Mobile checkout/installments.tsx)
tsxtype InstallmentDuration = '1_month' | '3_months' | '6_months' | '8_months';

const DURATION_OPTIONS: { value: InstallmentDuration; label: string; description: string }[] = [
{ value: '1_month', label: '1 Month Plan', description: 'Pay in full after 1 month' },
{ value: '3_months', label: '3 Months Plan', description: 'Split payment over 3 months' },
{ value: '6_months', label: '6 Months Plan', description: 'Split payment over 6 months' },
{ value: '8_months', label: '8 Months Plan', description: 'Split payment over 8 months' }, // ← replaces 1_year
];

Code: Installment Follow-Up UI in order-tracking.tsx
This is the main screen where customers check their order — it's where installment status and the "Pay Next" button must live. Add a new section after the timeline:
tsx// Add these imports at top
import {
useGetInstallmentPlanDetailsQuery,
useInitializeNextInstallmentMutation,
} from '@/lib/api/publicApi';
import { formatCurrency } from '@/lib/utils';

// Inside OrderTrackingScreen, after existing queries:
// Get plan_id from order detail (backend should return installment_plan.id on the order)
const planId = order?.installment_plan?.id;

const { data: planResponse, refetch: refetchPlan } = useGetInstallmentPlanDetailsQuery(
planId ?? 0,
{ skip: !planId }
);
const plan = planResponse?.data;

const [initNextPayment, { isLoading: isInitingPayment }] = useInitializeNextInstallmentMutation();

const handlePayNextInstallment = async (installment: any) => {
try {
const res = await initNextPayment({
plan_id: plan!.id,
payment_number: installment.payment_number,
}).unwrap();

    router.push({
      pathname: '/checkout/webview' as any,
      params: {
        url: res.data.authorization_url,
        reference: res.data.reference,
        plan_id: String(plan!.id),
      },
    });

} catch (err: any) {
Toast.show({ type: 'error', text1: 'Failed to initialise payment', text2: err?.data?.error });
}
};
Then inside the ScrollView, after the timeline section and before the closing </ScrollView>:
tsx{/_ Installment Plan Section _/}
{plan && plan.status !== 'COMPLETED' && (
<View className="px-6 pb-8">
<Divider height={1} className="mb-6" />

    <Text className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">
      Installment Plan
    </Text>

    {/* Progress bar */}
    <View className="flex-row items-center mb-2">
      <Text className="text-[13px] text-gray-500 flex-1">
        {plan.paid_installments_count} of {plan.number_of_installments} paid
      </Text>
      <Text className="text-[13px] font-bold text-system-blue-light">
        {formatCurrency(plan.installment_amount)} / month
      </Text>
    </View>
    <View className="h-2 bg-gray-100 rounded-full mb-6">
      <View
        className="h-full bg-system-blue-light rounded-full"
        style={{
          width: `${(plan.paid_installments_count / plan.number_of_installments) * 100}%`,
        }}
      />
    </View>

    {/* Individual installments */}
    {plan.installments?.map((inst: any) => {
      const isPaid    = inst.status === 'PAID';
      const isOverdue = !isPaid && new Date(inst.due_date) < new Date();
      const isNext    = !isPaid && plan.installments!.filter((i: any) => i.status !== 'PAID').indexOf(inst) === 0;

      return (
        <View
          key={inst.payment_number}
          className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border ${
            isPaid    ? 'border-green-100 bg-green-50'
            : isOverdue ? 'border-red-100 bg-red-50'
            : isNext   ? 'border-blue-100 bg-blue-50'
            : 'border-gray-100 bg-gray-50'
          }`}
        >
          <View>
            <Text className="text-[14px] font-bold text-system-blue-dark">
              Installment #{inst.payment_number}
            </Text>
            <Text className="text-[12px] text-gray-400 mt-0.5">
              Due {new Date(inst.due_date).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[14px] font-bold text-system-blue-dark mb-1">
              {formatCurrency(inst.amount)}
            </Text>
            {isPaid ? (
              <View className="bg-green-100 px-2 py-0.5 rounded-full">
                <Text className="text-[11px] text-green-700 font-bold">Paid</Text>
              </View>
            ) : isNext ? (
              <TouchableOpacity
                onPress={() => handlePayNextInstallment(inst)}
                disabled={isInitingPayment}
                className="bg-system-blue-light px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white text-[12px] font-bold">
                  {isInitingPayment ? 'Loading…' : 'Pay Now'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className={`px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Text className={`text-[11px] font-bold ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                  {isOverdue ? 'Overdue' : 'Upcoming'}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    })}

  </View>
)}
For this to work, the backend's order detail endpoint must include installment_plan in its serializer output. Check transactions/serializers.py — if installment_plan isn't in OrderSerializer, add it:
python# transactions/serializers.py
from .models import InstallmentPlan

class InstallmentPlanSerializer(serializers.ModelSerializer):
paid_installments_count = serializers.SerializerMethodField()
pending_installments_count = serializers.SerializerMethodField()
installments = serializers.SerializerMethodField()

    def get_paid_installments_count(self, obj):   return obj.get_paid_installments_count()
    def get_pending_installments_count(self, obj): return obj.get_pending_installments_count()
    def get_installments(self, obj):
        return InstallmentPaymentSerializer(obj.installments.order_by('payment_number'), many=True).data

    class Meta:
        model  = InstallmentPlan
        fields = ['id', 'duration', 'total_amount', 'installment_amount',
                  'number_of_installments', 'paid_installments_count',
                  'pending_installments_count', 'status', 'start_date', 'installments']

class OrderSerializer(serializers.ModelSerializer):
installment_plan = InstallmentPlanSerializer(read_only=True) # ← add this # ...rest of fields
Also add an Installment tab or badge in (tabs)/orders.tsx to surface orders with active installment plans quickly.
Web: The web doesn't have an installment checkout page. You'll need to build one at app/checkout/installments/page.tsx mirroring the mobile screen with the same 4 duration options, and connect the order detail page similarly.

2. Vendor "Withdrawal Amount Exceeds Verified Earnings"
   What's Happening
   The validate_withdrawal_request in payout_service.py runs two checks:
   Check A: wallet.balance >= requested_amount — the wallet balance check.
   Check B (\_validate_vendor_verified_earnings): Re-calculates earnings from scratch:

If any DELIVERED + vendors_credited=True order has payment.verified=False → blocks everything
Sums OrderItem.price_at_purchase × quantity for delivered+credited+payment-verified orders
verified_earnings = subtotal × 0.90
If requested_amount > verified_earnings → rejects

Your case: You have a successful delivery in wallet history. That means vendors_credited=True on the order and the wallet was credited. But the Payment record tied to that order likely has verified=False (or doesn't exist), causing Check B's step 1 to block the withdrawal despite the wallet having the balance.
This can happen when:

The order was credited by signal (credit_vendors_for_order) but the Paystack webhook didn't create/verify the associated Payment record
Or the Payment.verified flag was never set to True even though money moved

The fundamental problem: The wallet balance is the source of truth (it reflects actual credited funds), but _validate_vendor_verified_earnings bypasses the wallet and recalculates from order items + payment verification status, which can contradict the wallet balance.
Fix
Backend — users/services/payout_service.py: Replace the \_validate_vendor_verified_earnings check with a simpler, wallet-based check. The wallet balance is already the safe source of truth:
python@staticmethod
def validate_withdrawal_request(user, amount):
from transactions.models import Wallet
wallet, _ = Wallet.objects.get_or_create(user=user)

    if Decimal(str(amount)) > wallet.balance:
        return False, (
            f"Insufficient balance. "
            f"Available: ₦{wallet.balance:,.2f}, Requested: ₦{amount:,.2f}"
        )

    if amount <= 0:
        return False, "Withdrawal amount must be greater than zero"

    from users.models import PaymentPIN
    try:
        pin_obj = PaymentPIN.objects.get(user=user)
        if pin_obj.is_default:
            return False, (
                "Please set a secure payment PIN before withdrawing. "
                "Default PIN (0000) is not allowed."
            )
    except PaymentPIN.DoesNotExist:
        return False, "Please set a payment PIN in Payment Settings before withdrawing."

    # REMOVED: _validate_vendor_verified_earnings — wallet.balance is the source of truth.
    # Earnings are only credited to the wallet on delivery, so the balance already
    # represents verified, withdrawable funds.

    return True, None

Also fix the underlying data issue: ensure the payment verification webhook properly sets Payment.verified = True. In transactions/signals.py or the Paystack webhook handler, when a payment is verified, confirm it's saved:
python# In VerifyInstallmentPaymentView or regular PaymentVerification webhook:
payment.verified = True
payment.save(update_fields=['verified'])
If the existing order's Payment record is unverified, you can fix it via Django admin or shell:
python# Django shell one-off fix
from transactions.models import Order, Payment
for order in Order.objects.filter(status='DELIVERED', vendors_credited=True):
Payment.objects.filter(order=order).update(verified=True)

3. Vendor Wallet History Back Button
   Confirmed: The back button in app/vendor/wallet/history.tsx IS a chevron:
   tsx<MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
   It's just using MaterialIcons instead of Feather (which is used on other screens). MaterialIcons chevron-left looks slightly different (filled vs outline style). To keep it visually consistent with the rest of the app, swap it:
   tsx// app/vendor/wallet/history.tsx — renderHeader
   import { Feather } from "@expo/vector-icons"; // add this import

// Change the back button from:
<MaterialIcons name="chevron-left" size={32} color={Colors.primary} />
// To:
<Feather name="chevron-left" size={32} color={Colors.primary} />

4. Customer Cancel Order — Full Implementation
   Current State
   There is no cancel order feature anywhere — no backend endpoint, no frontend UI. The OrderDetailView.delete() exists but that's a hard delete, not a cancel. There's no dedicated /cancel/ route.
   Rules (implement these)
   Order StatusCan Customer Cancel?ReasonPENDING (unpaid)✅ Yes, freelyNothing has moved yetPAID (not yet shipped)✅ Yes, with refund triggerAdmin must process refundSHIPPED❌ NoAlready in transitDELIVERED❌ NoReceivedCANCELLED❌ NoAlready cancelled
   Backend
   Add a dedicated cancel endpoint. The existing OrderDetailView.patch() is too permissive (customers could change any field). Add this to transactions/views.py:
   python# transactions/views.py — add after OrderDetailView

class CustomerCancelOrderView(APIView):
"""Customer-only endpoint to cancel their own order."""
permission_classes = [permissions.IsAuthenticated]

    CANCELLABLE_STATUSES = [Order.Status.PENDING, Order.Status.PAID]

    def post(self, request, order_id):
        try:
            order = Order.objects.select_related('customer', 'payment').get(
                order_id=order_id,
                customer=request.user
            )
        except Order.DoesNotExist:
            return Response(
                standardized_response(success=False, error="Order not found"),
                status=status.HTTP_404_NOT_FOUND
            )

        if order.status not in self.CANCELLABLE_STATUSES:
            return Response(
                standardized_response(
                    success=False,
                    error=f"Order cannot be cancelled. Current status: {order.status}."
                ),
                status=status.HTTP_400_BAD_REQUEST
            )

        previous_status = order.status
        order.status = Order.Status.CANCELED
        order.save(update_fields=['status'])

        # Notify vendor(s)
        from users.notification_helpers import send_user_notification
        vendor_users = set(
            item.product.store.user
            for item in order.order_items.select_related('product__store__user').all()
        )
        for vendor_user in vendor_users:
            send_user_notification(
                vendor_user,
                title="Order Cancelled",
                message=f"Order #{str(order.order_id)[:8]} was cancelled by the customer.",
                category='order',
            )

        # If already paid — flag for refund (don't refund automatically here)
        needs_refund = previous_status == Order.Status.PAID and hasattr(order, 'payment') and order.payment.verified

        return Response(
            standardized_response(
                data={
                    "order_id": str(order.order_id),
                    "status": "CANCELLED",
                    "refund_pending": needs_refund,
                },
                message="Order cancelled successfully."
                + (" A refund will be processed within 3–5 business days." if needs_refund else ""),
            ),
            status=status.HTTP_200_OK
        )

Add to transactions/urls.py:
pythonfrom .views import CustomerCancelOrderView

path('orders/<uuid:order_id>/cancel/', CustomerCancelOrderView.as_view(), name='cancel-order'),
Mobile API Hook — lib/api/publicApi.ts
tscancelOrder: builder.mutation
{ success: boolean; data: { order_id: string; status: string; refund_pending: boolean }; message: string },
string // order_id

> ({
> query: (order_id) => ({

    url: `/transactions/orders/${order_id}/cancel/`,
    method: 'POST',

}),
invalidatesTags: ['Orders'],
}),
Export it: useCancelOrderMutation.
Mobile UI — app/order-tracking.tsx
tsx// Add import
import { useCancelOrderMutation } from '@/lib/api/publicApi';
import { Alert } from 'react-native';

// Inside the component, after existing queries:
const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

const canCancel = order && ['PENDING', 'PAID'].includes(order.status) && order.status !== 'CANCELLED';

const handleCancelOrder = () => {
Alert.alert(
'Cancel Order',
order?.status === 'PAID'
? 'This order has been paid. Cancelling will initiate a refund (3–5 business days). Are you sure?'
: 'Are you sure you want to cancel this order?',
[
{ text: 'Keep Order', style: 'cancel' },
{
text: 'Cancel Order',
style: 'destructive',
onPress: async () => {
try {
const res = await cancelOrder(order!.order_id).unwrap();
Toast.show({
type: 'success',
text1: 'Order Cancelled',
text2: res.message,
});
router.back();
} catch (err: any) {
Toast.show({
type: 'error',
text1: 'Could not cancel order',
text2: err?.data?.error || 'Please try again.',
});
}
},
},
]
);
};
Inside the ScrollView, after the <Divider>, add:
tsx{canCancel && (
<View className="px-6 pb-8">
<TouchableOpacity
      onPress={handleCancelOrder}
      disabled={isCancelling}
      className="border-2 border-red-200 rounded-xl p-4 items-center bg-red-50"
    >
<Text className="text-red-600 font-bold text-[15px]">
{isCancelling ? 'Cancelling…' : 'Cancel Order'}
</Text>
{order?.status === 'PAID' && (
<Text className="text-red-400 text-[12px] mt-1">
Refund will be processed in 3–5 business days
</Text>
)}
</TouchableOpacity>
</View>
)}
Web — Customer Order Detail
Apply the same cancelOrder mutation (add useCancelOrderMutation to publicApi in the web app too) and show the cancel button in the order detail page when status === 'PENDING' || status === 'PAID'.

5. Suspended User — Can They Still Login?
   Confirmed: Backend correctly blocks them
   The suspend_user action does:
   pythonuser.is_active = not suspend # sets is_active=False when suspending
   user.save(update_fields=["is_active"])
   And AuthenticationService.login() checks:
   pythonif not user.is_active:
   return False, {"success": False, "error": "Account is disabled. Please contact support."}, 403
   So a suspended user cannot log in — the backend correctly blocks them with a 403.
   Gap 1: user.status field is never updated
   suspend_user only sets is_active=False but never sets user.status = 'SUSPENDED'. This means user.is_suspended() always returns False, which could confuse any code that uses that property. Fix this in the backend:
   python# users/views.py — suspend_user action
   user.is_active = not suspend
   user.status = 'SUSPENDED' if suspend else 'ACTIVE' # ← add this
   user.save(update_fields=["is_active", "status"])
   Gap 2: Mobile login shows a generic error
   The mobile login.tsx catches a 403 for email_not_verified and redirects to verify-notice. But a suspended user also gets a 403 — it falls through to the generic error message. Make it specific:
   tsx// app/(auth)/login.tsx — in the catch block
   } catch (err: any) {
   if (err?.status === 403 && err?.data?.email_not_verified) {
   router.replace({ pathname: '/(auth)/verify-notice', params: { email } });
   return;
   }

// ← add this block
if (err?.status === 403) {
setError(
err?.data?.error ||
'Your account has been suspended. Please contact support.'
);
return;
}

setError(err?.data?.error || 'Login failed. Please check your credentials.');
}
Gap 3: Already-logged-in suspended users
If the admin suspends someone who is currently logged in, they can keep using the app until their JWT expires (typically 15 mins–1hr). The only real-time block would come from API calls returning 403s (since is_active=False means Django won't authenticate their token on subsequent calls). The mobile and web already redirect to login on auth errors via their base API config, so this is handled implicitly — but you should confirm baseApi.ts has a 401/403 interceptor that calls logout().

Quick Summary Table
IssueStatusFix LocationInstallment follow-up UI (Pay Next)❌ MissingAdd to order-tracking.tsx + web order detail8-month max planBackend + Frontendmodels.py, installments.tsx, web checkoutVendor "exceeds verified earnings"Backend bugRemove \_validate_vendor_verified_earnings, use wallet balance directlyWallet history back buttonMinor inconsistencySwap MaterialIcons → Feather chevron-leftCustomer cancel order❌ Not implementedNew backend endpoint + mobile + web UISuspended user loginBackend ✅, some gapsAdd status field update + better mobile error messageYou said: Well if the order is canceled how is the refund processed, I told you I needed the full solution for it, will there be places in the admin to handle that, what…

