import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/products', label: 'Shop', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { to: '/wishlist', label: 'Saved', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { to: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <div className="w-full bg-neutral-900/95 backdrop-blur-md p-2 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center py-1 px-3 rounded-xl text-xs font-medium transition-all ${
              isActive ? 'text-pink-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
