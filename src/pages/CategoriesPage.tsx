import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function CategoriesPage() {
  const { productGroups } = useApp();

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    productGroups.forEach((g) => {
      const cat = g.product_type || 'General Pixel Gadgets';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [productGroups]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Verified Categories</h1>
        <p className="text-xs text-neutral-400">Derived strictly from verified <code className="font-mono">product_type</code> values.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/categories/${encodeURIComponent(cat.name)}`}
            className="bg-neutral-800/60 border border-neutral-700 hover:border-pink-500 rounded-xl p-6 cursor-pointer transition-all hover:scale-102 group block"
          >
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 group-hover:bg-pink-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">{cat.name}</h3>
            <p className="text-xs text-neutral-400 mt-1">{cat.count} Product Groups</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
