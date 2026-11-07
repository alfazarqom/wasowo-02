import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EDGE_FUNCTIONS } from '../config/backend';

export function PaymentPage() {
  const { merchantOrderId: paramOrderId } = useParams<{ merchantOrderId?: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Loading Duitku payment…');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem('divoom_pending_payment');
    const pending = stored ? JSON.parse(stored) : null;
    const merchantOrderId = paramOrderId || pending?.merchantOrderId;
    if (!pending?.reference || !pending?.email || !merchantOrderId || pending.merchantOrderId !== merchantOrderId) {
      setMessage('Payment session not found. Please check your order status or contact support.');
      return;
    }

    const checkStatus = async () => {
      try {
        const url = new URL(EDGE_FUNCTIONS.duitkuCheckout);
        url.searchParams.set('merchantOrderId', merchantOrderId);
        url.searchParams.set('email', pending.email);
        const response = await fetch(url.toString());
        const payload = await response.json();
        if (!response.ok || !payload?.success) throw new Error(payload?.error || 'Unable to check payment status.');
        const status = payload.data.paymentStatus;
        if (!cancelled) {
          setPaymentStatus(status);
          if (status === 'paid') {
            setMessage('Payment confirmed by server. You can now view your order confirmation.');
          } else if (status === 'failed' || status === 'expired' || status === 'invoice_failed') {
            setMessage('Payment was not completed. Your order remains available for review.');
          } else {
            setMessage('Waiting for payment confirmation from Duitku…');
          }
        }
      } catch {
        if (!cancelled) setMessage('Payment is processing. We could not refresh its status just now.');
      }
    };

    const scriptUrl = 'https://app-sandbox.duitku.com/lib/js/duitku.js';
    const existingScript = document.querySelector('script[data-divoom-duitku="true"]') as HTMLScriptElement | null;
    const launch = () => {
      const duitkuWindow = window as Window & { checkout?: { process: (reference: string, options: Record<string, unknown>) => void } };
      if (!duitkuWindow.checkout) {
        setMessage('Duitku popup library is unavailable. Please reload this page or contact support.');
        return;
      }
      setMessage('Duitku secure payment window is ready.');
      duitkuWindow.checkout.process(pending.reference, {
        defaultLanguage: 'id',
        successEvent: () => { void checkStatus(); },
        pendingEvent: () => { void checkStatus(); },
        errorEvent: () => { void checkStatus(); },
        closeEvent: () => { setMessage('Payment window closed. You can reopen it below.'); void checkStatus(); }
      });
    };

    if (existingScript) {
      if ((window as Window & { checkout?: unknown }).checkout) launch();
      else existingScript.addEventListener('load', launch, { once: true });
    } else {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.dataset.divoomDuitku = 'true';
      script.onload = launch;
      script.onerror = () => setMessage('Unable to load Duitku popup library.');
      document.body.appendChild(script);
    }

    const interval = window.setInterval(() => { void checkStatus(); }, 5000);
    void checkStatus();
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [paramOrderId]);

  const reopenPopup = () => {
    const stored = localStorage.getItem('divoom_pending_payment');
    const pending = stored ? JSON.parse(stored) : null;
    const duitkuWindow = window as Window & { checkout?: { process: (reference: string, options: Record<string, unknown>) => void } };
    if (pending?.reference && duitkuWindow.checkout) {
      duitkuWindow.checkout.process(pending.reference, {
        defaultLanguage: 'id',
        successEvent: () => window.location.reload(),
        pendingEvent: () => window.location.reload(),
        errorEvent: () => window.location.reload(),
        closeEvent: () => undefined
      });
    }
  };

  return (
    <div className="space-y-6 text-center max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Duitku Secure Payment</h1>
      <p className="text-sm text-neutral-300">{message}</p>
      {paymentStatus && <p className="text-xs text-neutral-400">Server payment status: {paymentStatus}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reopenPopup} className="bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg">
          Open Payment Window
        </button>
        {paymentStatus === 'paid' && (
          <button onClick={() => navigate(`/order-success/${paramOrderId || ''}`)} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow">
            View Order Confirmation
          </button>
        )}
      </div>
      <p className="text-xs text-neutral-500">Payment is confirmed only after the verified server callback updates your order.</p>
    </div>
  );
}
