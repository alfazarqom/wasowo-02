import React from 'react';
import { Link } from 'react-router-dom';

export function OrderSuccessPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Order Payment Confirmed</h1>
      <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
        Your payment status was confirmed by the verified Duitku server callback.
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
