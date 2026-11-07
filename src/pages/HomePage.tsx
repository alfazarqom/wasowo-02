import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { LoadingGrid } from '../components/common/LoadingGrid';

export function HomePage() {
  const { productGroups, loading, error } = useApp();

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 border border-neutral-800 p-8 sm:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-4">
          <span className="inline-block px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            Retro Aesthetics & Modern Sound
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Light Up Your World With <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400">Pixel Art</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-300">
            Explore Divoom's iconic bluetooth speakers, Smart LED displays, and custom pixel hardware.
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
            <Link
              to="/products"
              className="bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-pink-600/30 inline-block"
            >
              Browse Catalog
            </Link>
            <Link
              to="/categories"
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm px-6 py-3 rounded-xl border border-neutral-700 transition-colors inline-block"
            >
              View Categories
            </Link>
          </div>
        </div>
        <div className="w-full md:w-80 h-64 bg-neutral-800/60 rounded-2xl border border-neutral-700 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 group-hover:opacity-75 transition-opacity" />
          <svg className="w-24 h-24 text-pink-400 animate-pulse relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Featured Gear</h2>
            <p className="text-xs text-neutral-400">Hand-picked pixel art innovations</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
          >
            See All ({productGroups.length}) &rarr;
          </Link>
        </div>

        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <div role="alert" className="rounded-xl border border-red-900/60 bg-red-950/20 p-6 text-center text-sm text-red-300">
            Product catalog is temporarily unavailable. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productGroups.slice(0, 4).map((group) => (
              <ProductCard key={group.item_group_id} group={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
