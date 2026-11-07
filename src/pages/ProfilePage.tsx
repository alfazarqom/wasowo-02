import React from 'react';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-6 space-y-4 text-center">
        <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
          G
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Guest Customer Session</h1>
          <p className="text-xs text-neutral-400 mt-1">
            No registration or login required. Your cart & saved items are stored locally in your browser.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-700/60 grid grid-cols-2 gap-4 text-left text-xs">
          <Link
            to="/orders"
            className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg hover:border-pink-500 transition-colors block"
          >
            <div className="font-bold text-white">Order Lookup</div>
            <div className="text-neutral-400 text-[11px]">View recent session purchases</div>
          </Link>

          <Link
            to="/wishlist"
            className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg hover:border-pink-500 transition-colors block"
          >
            <div className="font-bold text-white">Saved Wishlist</div>
            <div className="text-neutral-400 text-[11px]">Manage bookmarked hardware</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
