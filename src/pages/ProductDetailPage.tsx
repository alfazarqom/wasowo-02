import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatIDR, sanitizeImageList } from '../utils/formatters';
import { PlaceholderImage } from '../components/common/PlaceholderImage';
import { EmptyState } from '../components/common/EmptyState';

export function ProductDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { productGroups, addToCart, toggleWishlist, isInWishlist, setSelectedProductVariant } = useApp();

  const group = useMemo(() => {
    return productGroups.find(g => g.item_group_id === groupId) || productGroups[0];
  }, [productGroups, groupId]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    if (group && group.variants.length > 0) {
      setSelectedVariantId(group.variants[0].id);
    }
  }, [group]);

  const activeVariant = group?.variants.find(v => v.id === selectedVariantId) || group?.variants[0];

  useEffect(() => {
    if (activeVariant) {
      setSelectedProductVariant(activeVariant);
    }
    return () => {
      setSelectedProductVariant(null);
    };
  }, [activeVariant, setSelectedProductVariant]);

  if (!group || !activeVariant) {
    return <EmptyState title="Product Not Found" subtitle="The requested product group does not exist." />;
  }

  const galleryImages = sanitizeImageList(activeVariant.image_link, activeVariant.additional_image_link);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Product Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-neutral-800/80 rounded-2xl border border-neutral-700 relative overflow-hidden flex items-center justify-center">
            {galleryImages.length > 0 ? (
              <img
                src={galleryImages[activeImageIndex]}
                alt={activeVariant.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <PlaceholderImage text={activeVariant.title} />
            )}
            {activeVariant.sale_price && (
              <span className="absolute top-4 left-4 bg-pink-600 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                Sale
              </span>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    activeImageIndex === idx ? 'border-pink-500' : 'border-neutral-700 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Variant Selector */}
        <div className="space-y-6">
          <div>
            {activeVariant.brand && (
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                {activeVariant.brand}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {activeVariant.title}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Group ID: <code className="text-neutral-300 font-mono">{group.item_group_id}</code></p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {formatIDR(activeVariant.sale_price ?? activeVariant.price)}
            </span>
            {activeVariant.sale_price && (
              <span className="text-sm text-neutral-500 line-through">
                {formatIDR(activeVariant.price)}
              </span>
            )}
          </div>

          {/* Availability */}
          <div className="text-xs">
            <span className="text-neutral-400">Availability: </span>
            <span className="font-semibold text-emerald-400 capitalize">
              {activeVariant.availability || 'In Stock'}
            </span>
          </div>

          {/* Color Selector */}
          {group.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Color Variant: <span className="text-white font-normal">{activeVariant.color}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {group.variants.map((variant) => {
                  if (!variant.color) return null;
                  const isSelected = variant.id === activeVariant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setActiveImageIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                          : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      {variant.color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Actions */}
          <div className="pt-4 border-t border-neutral-800 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-neutral-700 rounded-lg bg-neutral-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  -
                </button>
                <span className="px-3 text-sm font-semibold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => addToCart(activeVariant, quantity)}
                className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </button>

              <button
                type="button"
                aria-label="Toggle wishlist"
                onClick={() => toggleWishlist(activeVariant.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  isInWishlist(activeVariant.id)
                    ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                    : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <svg className="w-6 h-6" fill={isInWishlist(activeVariant.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description */}
          {activeVariant.description && (
            <div className="pt-4 border-t border-neutral-800">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Overview</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{activeVariant.description}</p>
            </div>
          )}

          {/* Rich Text Description */}
          {activeVariant.rich_text_description && (
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <h3 className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Detailed Specifications & Highlights</h3>
              <div 
                className="text-sm text-neutral-300 leading-relaxed space-y-2 prose prose-invert max-w-none prose-p:my-1 prose-ul:list-disc prose-ul:pl-4"
                dangerouslySetInnerHTML={{ __html: activeVariant.rich_text_description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
