import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatIDR } from '../utils/formatters';
import { PlaceholderImage } from '../components/common/PlaceholderImage';
import { EmptyState } from '../components/common/EmptyState';

export function WishlistPage() {
  const { wishlist, products, toggleWishlist, addToCart } = useApp();

  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [wishlist, products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Saved Items</h1>
        <p className="text-xs text-neutral-400">{wishlistProducts.length} items in your wishlist</p>
      </div>

      {wishlistProducts.length === 0 ? (
        <EmptyState title="Your Wishlist is Empty" subtitle="Save products here by clicking the heart icon while browsing." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((p) => (
            <div key={p.id} className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0">
                {p.image_link ? (
                  <img src={p.image_link} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <PlaceholderImage text={p.title} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{p.title}</h3>
                <p className="text-xs text-pink-400 font-semibold mt-1">{formatIDR(p.sale_price ?? p.price)}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="text-neutral-400 hover:text-red-400 text-xs py-1.5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
