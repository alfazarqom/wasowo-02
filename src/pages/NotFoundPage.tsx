import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="py-16 text-center space-y-4">
      <h1 className="text-6xl font-black text-pink-500">404</h1>
      <h2 className="text-xl font-bold text-white">Page Not Found</h2>
      <p className="text-xs text-neutral-400">The page route you requested does not exist in this application.</p>
      <Link
        to="/"
        className="mt-4 bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs px-6 py-2.5 rounded-lg inline-block"
      >
        Return to Home
      </Link>
    </div>
  );
}
