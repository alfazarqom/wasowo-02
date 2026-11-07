import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function Header({ isMinimal = false }: { isMinimal?: boolean }) {
  const { cart, wishlist, searchTerm, setSearchTerm } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          aria-label="Home"
          className="flex items-center gap-2 group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
            D
          </div>
        </Link>

        {/* Desktop Search Bar (Non-Minimal) */}
        {!isMinimal && (
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Search pixel art speakers, frames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('/search');
              }}
              className="w-full bg-neutral-800 border border-neutral-700 text-sm rounded-full pl-10 pr-4 py-2 text-white placeholder-neutral-400 focus:outline-none focus:border-pink-500 transition-colors"
            />
            <svg className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}

        {/* Desktop Navigation Links */}
        {!isMinimal && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-neutral-300">
            <Link 
              to="/" 
              className={`hover:text-pink-400 transition-colors ${isActive('/') ? 'text-pink-500 font-semibold' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`hover:text-pink-400 transition-colors ${isActive('/products') ? 'text-pink-500 font-semibold' : ''}`}
            >
              Products
            </Link>
            <Link 
              to="/categories" 
              className={`hover:text-pink-400 transition-colors ${isActive('/categories') ? 'text-pink-500 font-semibold' : ''}`}
            >
              Categories
            </Link>
            <Link 
              to="/contact-us" 
              className={`hover:text-pink-400 transition-colors ${isActive('/contact') || isActive('/contact-us') ? 'text-pink-500 font-semibold' : ''}`}
            >
              Contact
            </Link>
          </nav>
        )}

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          {!isMinimal && (
            <Link 
              to="/search" 
              aria-label="Search"
              className="md:hidden p-2 text-neutral-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          )}

          {!isMinimal && (
            <Link 
              to="/wishlist" 
              aria-label="Wishlist"
              className="relative p-2 text-neutral-400 hover:text-pink-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
          )}

          <Link 
            to="/cart" 
            aria-label="Cart"
            className="relative p-2 text-neutral-400 hover:text-pink-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
