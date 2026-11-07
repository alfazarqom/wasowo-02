import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';

export function CategoryDetailPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : 'All Categories';
  const { productGroups } = useApp();

  const filteredGroups = useMemo(() => {
    return productGroups.filter(g => (g.product_type || 'General Pixel Gadgets') === decodedCategory);
  }, [productGroups, decodedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Category</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">{decodedCategory}</h1>
          <p className="text-xs text-neutral-400">{filteredGroups.length} items in this category</p>
        </div>
        <Link
          to="/categories"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          &larr; Back to Categories
        </Link>
      </div>

      {filteredGroups.length === 0 ? (
        <EmptyState title="Category Empty" subtitle="No product groups match this category filter." />
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
