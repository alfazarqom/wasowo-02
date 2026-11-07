import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../utils/formatters';

export function BottomActionBar() {
  const location = useLocation();
  const path = location.pathname;
  const { 
    productGroups, 
    selectedProductVariant, 
    addToCart, 
    toggleWishlist, 
    isInWishlist,
    cart 
  } = useApp();

  const isProductDetailPage = path.startsWith('/products/');
  const isCartPage = path === '/cart';
  const isCheckoutPage = path === '/checkout';
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 1. SPECIFIC LAYOUT FOR PRODUCT DETAIL PAGES (e.g. /products/astrotoo, /products/ditoopro)
  if (isProductDetailPage) {
    const groupId = path.split('/products/')[1]?.split('/')[0]?.split('?')[0];
    const group = productGroups.find(g => g.item_group_id === groupId);
    const activeProduct = selectedProductVariant || group?.representativeRecord || group?.variants[0];

    if (activeProduct) {
      const isWishlisted = isInWishlist(activeProduct.id);
      const price = activeProduct.sale_price ?? activeProduct.price;

      return (
        <div className="w-full bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 p-3 px-4 flex items-center justify-between gap-3 shadow-2xl">
          {/* Price & Variant Overview */}
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
              {activeProduct.color ? activeProduct.color : 'Harga'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-white truncate">
                {formatIDR(price)}
              </span>
              {activeProduct.sale_price && (
                <span className="text-[10px] text-neutral-500 line-through">
                  {formatIDR(activeProduct.price)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: Wishlist & Add to Cart */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Quick Cart Jump if items in cart */}
            {cartItemCount > 0 && (
              <Link
                to="/cart"
                aria-label="Lihat Keranjang"
                className="relative p-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white transition-all active:scale-95 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              </Link>
            )}

            {/* Tombol Add to Wishlist */}
            <button
              type="button"
              aria-label={isWishlisted ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
              onClick={() => toggleWishlist(activeProduct.id)}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                isWishlisted
                  ? 'border-pink-500 bg-pink-500/15 text-pink-500 shadow-sm'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <svg 
                className="w-5 h-5" 
                fill={isWishlisted ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Tombol Add to Cart */}
            <button
              type="button"
              onClick={() => addToCart(activeProduct, 1)}
              className="flex-1 max-w-[190px] bg-pink-600 hover:bg-pink-500 active:scale-95 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>+ Add to Cart</span>
            </button>
          </div>
        </div>
      );
    }
  }

  // 2. LAYOUT FOR CART PAGE
  if (isCartPage) {
    return (
      <div className="w-full bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 p-3 px-4 flex justify-between items-center gap-3">
        <Link
          to="/products"
          className="flex-1 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-semibold py-2.5 px-4 rounded-xl text-center transition-all border border-neutral-700"
        >
          &larr; Lanjut Belanja
        </Link>
        <Link
          to="/checkout"
          className="flex-1 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-all shadow-lg shadow-pink-600/30"
        >
          Checkout Sekarang &rarr;
        </Link>
      </div>
    );
  }

  // 3. LAYOUT FOR CHECKOUT PAGE
  if (isCheckoutPage) {
    return (
      <div className="w-full bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 p-3 px-4 flex justify-between items-center gap-3">
        <Link
          to="/cart"
          className="flex-1 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-semibold py-2.5 px-4 rounded-xl text-center transition-all border border-neutral-700"
        >
          &larr; Ubah Keranjang
        </Link>
        <Link
          to="/products"
          className="flex-1 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-semibold py-2.5 px-4 rounded-xl text-center transition-all border border-neutral-700"
        >
          Lihat Katalog
        </Link>
      </div>
    );
  }

  // 4. GENERAL FALLBACK FOR OTHER ACTION ROUTES (Search, Tracking, Orders, Contact)
  return (
    <div className="w-full bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 p-3 px-4 flex justify-between items-center gap-3">
      <Link
        to="/products"
        className="flex-1 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-semibold py-2.5 px-4 rounded-xl text-center transition-all border border-neutral-700"
      >
        Katalog Produk
      </Link>
      <Link
        to="/cart"
        className="flex-1 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-all shadow-lg shadow-pink-600/30"
      >
        Lihat Keranjang {cartItemCount > 0 ? `(${cartItemCount})` : ''} &rarr;
      </Link>
    </div>
  );
}
