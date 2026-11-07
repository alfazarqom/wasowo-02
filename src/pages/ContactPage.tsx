import React from 'react';

export function ContactPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contact Divoom Support</h1>
        <p className="text-xs text-neutral-400">Have questions regarding your pixel art device?</p>
      </div>

      <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 space-y-4 text-xs">
        <div>
          <span className="font-bold text-white block">Official Channel</span>
          <span className="text-neutral-400">support@divoom.com</span>
        </div>
        <div>
          <span className="font-bold text-white block">API Specification</span>
          <span className="text-neutral-400 font-mono text-[11px]">Supabase Edge Function get-divoom-products</span>
        </div>
      </div>
    </div>
  );
}
