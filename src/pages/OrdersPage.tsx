import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SavedPendingOrder {
  merchantOrderId: string;
  reference: string;
  email: string;
}

export function OrdersPage() {
  const [lastOrder, setLastOrder] = useState<SavedPendingOrder | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('divoom_pending_payment');
    if (stored) {
      try { 
        setLastOrder(JSON.parse(stored)); 
      } catch { 
        setLastOrder(null); 
      }
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Order History</h1>
        <p className="text-xs text-neutral-400">Guest orders created in this browser session.</p>
      </div>

      {lastOrder?.merchantOrderId ? (
        <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-6 space-y-4">
          <div className="flex justify-between gap-3 text-xs">
            <span className="text-neutral-400">Merchant Order ID</span>
            <span className="font-mono text-white">{lastOrder.merchantOrderId}</span>
          </div>
          <p className="text-xs text-neutral-400">Order and payment status are retrieved from Supabase using the guest email saved for this checkout.</p>
          <Link
            to={`/orders/${lastOrder.merchantOrderId}`}
            className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-block"
          >
            View Order Status
          </Link>
        </div>
      ) : (
        <div className="bg-neutral-800/40 border border-neutral-700/80 rounded-xl p-8 text-center space-y-3">
          <h3 className="text-sm font-bold text-white">No recent guest order in this browser</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">After checkout, your latest merchant order ID is saved locally so you can reopen its server-confirmed status here.</p>
          <Link
            to="/products"
            className="mt-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-block"
          >
            Explore Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
