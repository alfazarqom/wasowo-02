import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { LoadingGrid } from '../components/common/LoadingGrid';
import { EmptyState } from '../components/common/EmptyState';

export function ProductsPage() {
  const { productGroups, loading, error } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const types = useMemo(() => {
    const set = new Set<string>();
    productGroups.forEach((g) => {
      if (g.product_type) set.add(g.product_type);
    });
    return Array.from(set);
  }, [productGroups]);

  const filteredGroups = useMemo(() => {
    let result = [...productGroups];
    if (filterType !== 'all') {
      result = result.filter(g => g.product_type === filterType);
    }
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.minPrice - a.minPrice);
    }
    return result;
  }, [productGroups, filterType, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">All Products</h1>
          <p className="text-xs text-neutral-400">Browsing {filteredGroups.length} product groups</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {types.length > 0 && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingGrid />
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-900/60 bg-red-950/20 p-6 text-center text-sm text-red-300">
          Product catalog is temporarily unavailable. Please try again later.
        </div>
      ) : filteredGroups.length === 0 ? (
        <EmptyState title="No products found" subtitle="Try clearing your category or sort filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGroups.map(group => (
            <ProductCard key={group.item_group_id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
