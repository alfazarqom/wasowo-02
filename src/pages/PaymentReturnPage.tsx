import React, { useState, useEffect } from 'react';
import { EDGE_FUNCTIONS } from '../config/backend';
import { useSearchParams, Link } from 'react-router-dom';

export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Checking payment status with the server…');

  useEffect(() => {
    let cancelled = false;
    const merchantOrderId = searchParams.get('merchantOrderId') || '';
    const pending: { merchantOrderId?: string; email?: string } | null = (() => {
      try {
        const stored = localStorage.getItem('divoom_pending_payment');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();
    if (!merchantOrderId || !pending?.email || pending.merchantOrderId !== merchantOrderId) {
      setStatus('Order reference is unavailable. Please use Order Lookup or contact support.');
      return;
    }
    const customerEmail = pending.email;
    const check = async () => {
      try {
        const url = new URL(EDGE_FUNCTIONS.duitkuCheckout);
        url.searchParams.set('merchantOrderId', merchantOrderId);
        url.searchParams.set('email', customerEmail);
        const response = await fetch(url.toString());
        const payload = await response.json();
        if (!response.ok || !payload?.success) throw new Error();
        if (!cancelled) setStatus(`Server-confirmed payment status: ${payload.data.paymentStatus}`);
      } catch {
        if (!cancelled) setStatus('Payment status is not available yet. Please refresh in a moment.');
      }
    };
    void check();
    return () => { cancelled = true; };
  }, [searchParams]);

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-bold text-white">Payment Status</h1>
      <p className="text-sm text-neutral-300">{status}</p>
      <p className="text-xs text-neutral-500">The browser redirect is not proof of payment. The server callback is authoritative.</p>
      <Link to="/" className="bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs px-6 py-2.5 rounded-lg inline-block">
        Return to Store
      </Link>
    </div>
  );
}
