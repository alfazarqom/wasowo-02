import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

type VerificationState = 'loading' | 'paid' | 'not_paid' | 'unavailable';

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId?: string }>();
  const [verificationState, setVerificationState] = useState<VerificationState>('loading');

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      try {
        const stored = localStorage.getItem('divoom_pending_payment');
        const pending = stored ? JSON.parse(stored) : null;
        const merchantOrderId = orderId || pending?.merchantOrderId;
        const email = typeof pending?.email === 'string' ? pending.email.trim() : '';

        if (
          !merchantOrderId ||
          !email ||
          (orderId && pending?.merchantOrderId !== orderId)
        ) {
          if (!cancelled) setVerificationState('unavailable');
          return;
        }

        const url = new URL('https://mvwflakurihhakdrlteg.supabase.co/functions/v1/divoom-duitku-create-invoice');
        url.searchParams.set('merchantOrderId', merchantOrderId);
        url.searchParams.set('email', email);

        const response = await fetch(url.toString(), { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || 'Unable to verify payment.');
        }

        if (!cancelled) {
          setVerificationState(payload?.data?.paymentStatus === 'paid' ? 'paid' : 'not_paid');
        }
      } catch {
        if (!cancelled) setVerificationState('unavailable');
      }
    };

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const isPaid = verificationState === 'paid';

  return (
    <div className="space-y-6 text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-700/60 text-neutral-300'}`}>
        {isPaid ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
        {verificationState === 'loading'
          ? 'Verifying Payment'
          : isPaid
            ? 'Order Payment Confirmed'
            : 'Payment Not Confirmed'}
      </h1>
      <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
        {verificationState === 'loading'
          ? 'Checking the latest payment status with the verified server…'
          : isPaid
            ? 'Your payment status was confirmed by the verified Duitku server callback.'
            : verificationState === 'not_paid'
              ? 'The server has not confirmed this payment as paid. Please return to the payment page and check the latest status.'
              : 'We could not verify this order. Open the payment page from the same browser session or contact support for assistance.'}
      </p>

      <Link
        to="/"
        className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs px-6 py-3 rounded-xl border border-neutral-700 inline-block transition-colors"
      >
        Back to Home Storefront
      </Link>
    </div>
  );
}
