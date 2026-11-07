import React from 'react';

export function OrderTrackingPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Shipment Tracking</h1>
        <p className="text-xs text-neutral-400">Real-time status integration boundary</p>
      </div>

      <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter Waybill / Tracking Number..."
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
          />
          <button className="bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-pink-500 transition-colors">
            Track
          </button>
        </div>
        <p className="text-[11px] text-neutral-500">
          * Note: Live logistics APIs (e.g. J&T, POS Indonesia, DHL) are currently disconnected in frontend demo.
        </p>
      </div>
    </div>
  );
}
