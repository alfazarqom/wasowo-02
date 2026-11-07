import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatIDR } from '../utils/formatters';
import { OrderStatusData } from '../types';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderStatusData | null>(null);
  const [message, setMessage] = useState('Loading order from the server…');

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem('divoom_pending_payment');
    const pending = stored ? JSON.parse(stored) : null;
    if (!orderId || !pending?.email || pending.merchantOrderId !== orderId) {
      setMessage('Order lookup details are not available in this guest browser session.');
      return;
    }
    const url = new URL('https://mvwflakurihhakdrlteg.supabase.co/functions/v1/divoom-duitku-create-invoice');
    url.searchParams.set('merchantOrderId', orderId);
    url.searchParams.set('email', pending.email);
    fetch(url.toString())
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload?.success) throw new Error(payload?.error || 'Order not found.');
        if (!cancelled) {
          setOrder(payload.data);
          setMessage('Order loaded from Supabase.');
        }
      })
      .catch((error) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Unable to load order.');
      });
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Order Detail</h1>
        <Link to="/orders" className="text-xs text-neutral-400 hover:text-white transition-colors">
          &larr; Back to Orders
        </Link>
      </div>

      <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 space-y-4">
        <div className="flex justify-between border-b border-neutral-700 pb-3 text-xs">
          <span className="text-neutral-400">Order Ref:</span>
          <span className="font-mono text-white font-bold">{orderId || '—'}</span>
        </div>
        <p className="text-xs text-neutral-400">{message}</p>
        {order && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Subtotal</span><span>{formatIDR(order.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Shipping</span><span>{formatIDR(order.shippingCost)}</span></div>
            <div className="flex justify-between border-t border-neutral-700 pt-3 font-bold"><span>Total</span><span className="text-pink-400">{formatIDR(order.totalAmount)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Order status</span><span className="capitalize">{order.orderStatus}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Payment status</span><span className="capitalize">{order.paymentStatus}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
