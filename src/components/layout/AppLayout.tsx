import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNavigation } from './BottomNavigation';
import { BottomActionBar } from './BottomActionBar';
import { Toast } from '../common/Toast';
import { useApp } from '../../context/AppContext';

export function AppLayout() {
  const { usingFallbackData, toastMessage } = useApp();
  const location = useLocation();
  const path = location.pathname;

  const isNavPath = ['/', '/products', '/categories', '/wishlist', '/profile', '/orders'].includes(path);
  const isActionBarPath = path.startsWith('/products/') || ['/search', '/cart', '/checkout', '/tracking', '/contact', '/contact-us'].includes(path) || path.startsWith('/orders/');
  const hasBottomBar = isNavPath || isActionBarPath;

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

      {/* Main Container with dynamic bottom padding on mobile to prevent content clipping */}
      <div className={`flex-1 flex flex-col min-h-screen relative ${hasBottomBar ? 'pb-20 md:pb-0' : ''}`}>
        <Header />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>

        <Footer />

        {/* Fixed Mobile Bottom Bar: Selalu berada di bawah layar (fixed to viewport bottom) pada mobile */}
        {hasBottomBar && (
          <div className="fixed bottom-0 inset-x-0 z-50 block md:hidden bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
            {isNavPath && <BottomNavigation />}
            {isActionBarPath && <BottomActionBar />}
          </div>
        )}
      </div>
    </div>
  );
}
