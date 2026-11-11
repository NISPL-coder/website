import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { razorpayApi, loadRazorpayCheckout } from '../services/razorpayApi';

const inr = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

// Tells the server which of the account's charges to price. The rupees
// themselves are always read from the database, never from here.
const scopePayload = (checkout) => {
  const payload = { method: 'razorpay' };
  if (checkout.invoiceNumber) payload.invoiceNumber = checkout.invoiceNumber;
  else if (checkout.mode === 'dues') payload.settleAll = true;
  else if (checkout.mode === 'renewal' && checkout.contractId) payload.contractId = checkout.contractId;
  if (checkout.partPayment && checkout.payAmount) {
    payload.partPayment = true;
    payload.payAmount = checkout.payAmount;
  }
  return payload;
};

/**
 * Opens Razorpay's own window straight from a Pay/Checkout button — there is
 * no intermediate checkout page. The server prices the order and enforces
 * the gateway cap, so its error message is shown as-is when online payment
 * is not possible (disabled keys, over the limit, nothing due).
 */
export function useRazorpayCheckout({ onSuccess } = {}) {
  const [isPaying, setIsPaying] = useState(false);
  const busyRef = useRef(false);

  const pay = useCallback(async (checkout) => {
    const amount = Math.round(Number(checkout?.amount) || 0);
    if (!amount) {
      toast('There is nothing due on this account right now.');
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    setIsPaying(true);

    const finish = () => {
      busyRef.current = false;
      setIsPaying(false);
    };

    const scriptReady = await loadRazorpayCheckout();
    if (!scriptReady) {
      finish();
      toast.error('Could not reach the secure payment page. Check your connection or ad-blocker and try again.');
      return;
    }

    let order;
    try {
      order = await razorpayApi.createOrder(scopePayload(checkout));
    } catch (err) {
      finish();
      toast.error(err?.message || 'Could not start the payment. Please try again.');
      return;
    }

    try {
      const gatewayWindow = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: order.name,
        description: order.label,
        order_id: order.orderId,
        prefill: order.prefill,
        notes: { intent: order.intentId },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            finish();
            toast('Payment window closed — nothing was charged.');
          }
        },
        handler: async (response) => {
          try {
            const data = await razorpayApi.verifyPayment(response);
            const total = Math.round(Number(data?.totals?.total) || order.amount);
            if (data?.alreadySettled) {
              toast.success('That invoice was already settled.');
            } else {
              toast.success(`${inr(total)} received — your receipt is ready.`);
            }
            await onSuccess?.(data);
          } catch (err) {
            if (err?.statusCode === 202) {
              // Captured at Razorpay, ledger still being written by the webhook.
              toast('Payment successful — your receipt is being generated.');
              await onSuccess?.(null);
            } else {
              toast.error('We could not confirm this payment. Please contact support before trying again.');
            }
          } finally {
            finish();
          }
        }
      });

      gatewayWindow.on('payment.failed', (response) => {
        finish();
        toast.error(
          response?.error?.description
            ? `Payment failed: ${response.error.description}`
            : 'The payment could not be completed. Nothing was charged.'
        );
      });

      gatewayWindow.open();
    } catch (err) {
      finish();
      toast.error(err?.message || 'Could not start the payment. Please try again.');
    }
  }, [onSuccess]);

  return { pay, isPaying };
}

export default useRazorpayCheckout;