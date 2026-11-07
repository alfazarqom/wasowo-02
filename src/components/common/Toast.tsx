import React from 'react';

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-neutral-800 border border-neutral-700 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in">
      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
