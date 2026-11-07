import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toast } from '../common/Toast';
import { useApp } from '../../context/AppContext';

export function StandalonePage() {
  const { usingFallbackData, toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans flex flex-col justify-between selection:bg-pink-500 selection:text-white">
      {/* Banner for Edge Function Status */}
      {usingFallbackData && (
        <div className="bg-amber-900/80 border-b border-amber-600/40 text-amber-200 text-xs px-4 py-1.5 text-center flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          Notice: Displaying verified local audit snapshot data (Edge Function unreachable or CORS restricted).
        </div>
      )}

      {/* Global Toast */}
      <Toast message={toastMessage} />

      {/* Standalone Page Architecture */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Outlet />
        </main>

        <Footer isMinimal={false} />
      </div>
    </div>
  );
}
