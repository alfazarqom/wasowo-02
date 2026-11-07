import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EDGE_FUNCTIONS } from '../config/backend';

export function PaymentPage() {
  const { merchantOrderId: paramOrderId } = useParams<{ merchantOrderId?: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Loading Duitku payment…');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [popupReady, setPopupReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const pending: { merchantOrderId?: string; reference?: string; email?: string } | null = (() => {
      try {
        const stored = localStorage.getItem('divoom_pending_payment');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();

    const merchantOrderId = paramOrderId || pending?.merchantOrderId;
    if (!pending?.reference || !pending?.email || !merchantOrderId || pending.merchantOrderId !== merchantOrderId) {
      setMessage('Payment session not found. Please check your order status or contact support.');
      setPopupReady(false);
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

    const markPopupReady = () => {
      const duitkuWindow = window as Window & { checkout?: unknown };
      if (!duitkuWindow.checkout) {
        setPopupReady(false);
        setMessage('Duitku popup library is unavailable. Please reload this page or contact support.');
        return;
      }
      setPopupReady(true);
      setMessage('Duitku secure payment window is ready. Select Open Payment Window to continue.');
    };

    const scriptUrl = 'https://app-sandbox.duitku.com/lib/js/duitku.js';
    const existingScript = document.querySelector('script[data-divoom-duitku="true"]') as HTMLScriptElement | null;

    if (existingScript) {
      if ((window as Window & { checkout?: unknown }).checkout) {
        markPopupReady();
      } else {
        existingScript.addEventListener('load', markPopupReady, { once: true });
        existingScript.addEventListener('error', () => {
          if (!cancelled) setMessage('Unable to load Duitku popup library.');
        }, { once: true });
      }
    } else {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.dataset.divoomDuitku = 'true';
      script.onload = markPopupReady;
      script.onerror = () => {
        if (!cancelled) setMessage('Unable to load Duitku popup library.');
      };
      document.body.appendChild(script);
    }

    const interval = window.setInterval(() => { void checkStatus(); }, 5000);
    void checkStatus();
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [paramOrderId]);

  const reopenPopup = () => {
    let pending: { merchantOrderId?: string; reference?: string } | null = null;
    try {
      const stored = localStorage.getItem('divoom_pending_payment');
      pending = stored ? JSON.parse(stored) : null;
    } catch {
      pending = null;
    }

    const duitkuWindow = window as Window & {
      checkout?: { process: (reference: string, options: Record<string, unknown>) => void };
    };
    if (pending?.reference && pending.merchantOrderId === paramOrderId && duitkuWindow.checkout) {
      duitkuWindow.checkout.process(pending.reference, {
        defaultLanguage: 'id',
        successEvent: () => window.location.reload(),
        pendingEvent: () => window.location.reload(),
        errorEvent: () => window.location.reload(),
        closeEvent: () => undefined,
      });
    }
  };

  return (
    <div className="space-y-6 text-center max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Duitku Secure Payment</h1>
      <p className="text-sm text-neutral-300">{message}</p>
      {paymentStatus && <p className="text-xs text-neutral-400">Server payment status: {paymentStatus}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reopenPopup}
          disabled={!popupReady || paymentStatus === 'paid' || paymentStatus === 'failed' || paymentStatus === 'expired' || paymentStatus === 'invoice_failed'}
          className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-lg"
        >
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
