import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EDGE_FUNCTIONS } from '../config/backend';

type ConfirmationState = 'checking' | 'paid' | 'pending' | 'failed' | 'unavailable';

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId?: string }>();
  const [confirmation, setConfirmation] = useState<ConfirmationState>('checking');

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const merchantOrderId = orderId ?? '';
      let pending: { merchantOrderId?: string; email?: string } | null = null;

      try {
        const stored = localStorage.getItem('divoom_pending_payment');
        pending = stored ? JSON.parse(stored) : null;
      } catch {
        pending = null;
      }

      if (!merchantOrderId || !pending?.email || pending.merchantOrderId !== merchantOrderId) {
        if (!cancelled) setConfirmation('unavailable');
        return;
      }

      try {
        const url = new URL(EDGE_FUNCTIONS.duitkuCheckout);
        url.searchParams.set('merchantOrderId', merchantOrderId);
        url.searchParams.set('email', pending.email);

        const response = await fetch(url.toString());
        const payload = await response.json();
        if (!response.ok || !payload?.success) throw new Error('Payment status unavailable');

        const status = payload.data?.paymentStatus;
        if (!cancelled) {
          if (status === 'paid') {
            setConfirmation('paid');
          } else if (status === 'failed' || status === 'expired' || status === 'invoice_failed') {
            setConfirmation('failed');
          } else {
            setConfirmation('pending');
          }
        }
      } catch {
        if (!cancelled) setConfirmation('unavailable');
      }
    };

    void verifyPayment();
    return () => { cancelled = true; };
  }, [orderId]);

  const heading = confirmation === 'paid'
    ? 'Order Payment Confirmed'
    : confirmation === 'checking'
      ? 'Verifying Payment'
      : confirmation === 'pending'
        ? 'Payment Is Still Pending'
        : confirmation === 'failed'
          ? 'Payment Was Not Completed'
          : 'Payment Status Unavailable';

  const description = confirmation === 'paid'
    ? 'The server has confirmed this payment through the verified Duitku callback.'
    : confirmation === 'checking'
      ? 'Checking the latest payment status with the server.'
      : confirmation === 'pending'
        ? 'We have not received a confirmed payment status yet. Do not treat this order as paid.'
        : confirmation === 'failed'
          ? 'The server reports that this payment was not completed.'
          : 'We could not verify this order. Return to the payment page or contact support.';

  return (
    <div className="space-y-6 text-center">
      {confirmation === 'paid' && (
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{heading}</h1>
      <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">{description}</p>

      {confirmation === 'pending' && orderId && (
        <Link
          to={`/payment/${encodeURIComponent(orderId)}`}
          className="bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs px-6 py-3 rounded-xl inline-block"
        >
          Return to Payment
        </Link>
      )}

      {(confirmation === 'paid' || confirmation === 'failed' || confirmation === 'unavailable') && (
        <Link
          to="/"
          className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs px-6 py-3 rounded-xl border border-neutral-700 inline-block transition-colors"
        >
          Back to Store
        </Link>
      )}
    </div>
  );
}
