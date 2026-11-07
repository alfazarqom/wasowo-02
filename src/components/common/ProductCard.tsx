import React from 'react';
import { Link } from 'react-router-dom';
import { ProductGroup } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../utils/formatters';
import { PlaceholderImage } from './PlaceholderImage';

export function ProductCard({ group }: { group: ProductGroup }) {
  const { toggleWishlist, isInWishlist } = useApp();
  const rep = group.representativeRecord;
  const isMultiPrice = group.minPrice !== group.maxPrice;
  const isWishlisted = isInWishlist(rep.id);

  return (
    <div className="bg-neutral-800/60 border border-neutral-700/80 hover:border-pink-500/80 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5">
      {/* Product Card Media */}
      <div className="aspect-square bg-neutral-900 relative overflow-hidden">
        {rep.image_link ? (
          <img
            src={rep.image_link}
            alt={group.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <PlaceholderImage text={group.title} />
        )}

        {/* Wishlist Button Overlay */}
        <button
          type="button"
          aria-label="Wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(rep.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            isWishlisted ? 'bg-pink-600 text-white' : 'bg-neutral-900/60 text-neutral-300 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {group.product_type && (
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block mb-1">
              {group.product_type}
            </span>
          )}
          <Link
            to={`/products/${group.item_group_id}`}
            className="text-sm font-bold text-white hover:text-pink-400 cursor-pointer line-clamp-2 transition-colors block"
          >
            {group.title}
          </Link>
        </div>

        <div className="pt-2 border-t border-neutral-700/50 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block text-[10px]">Price</span>
            <span className="text-sm font-extrabold text-white">
              {isMultiPrice ? `${formatIDR(group.minPrice)} - ${formatIDR(group.maxPrice)}` : formatIDR(group.minPrice)}
            </span>
          </div>

          <Link
            to={`/products/${group.item_group_id}`}
            className="bg-neutral-700 hover:bg-pink-600 text-white p-2 rounded-lg transition-colors inline-flex items-center justify-center"
            aria-label={`View details for ${group.title}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
