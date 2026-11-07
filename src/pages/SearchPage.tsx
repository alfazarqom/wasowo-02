import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';

export function SearchPage() {
  const { searchTerm, setSearchTerm, productGroups } = useApp();

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return productGroups.filter(g =>
      g.title.toLowerCase().includes(q) ||
      (g.brand && g.brand.toLowerCase().includes(q)) ||
      (g.product_type && g.product_type.toLowerCase().includes(q))
    );
  }, [searchTerm, productGroups]);

  return (
    <div className="space-y-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-white text-center">Search Storefront</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, brand, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-pink-500"
          />
          <svg className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {searchTerm.trim() && (
        <div>
          <p className="text-xs text-neutral-400 mb-4">Found {results.length} results for "{searchTerm}"</p>
          {results.length === 0 ? (
            <EmptyState title="No matching results" subtitle="Try checking spelling or searching for broader terms like 'Speaker'." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map(group => (
                <ProductCard key={group.item_group_id} group={group} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
