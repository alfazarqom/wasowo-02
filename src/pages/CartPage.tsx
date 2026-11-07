import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatIDR } from '../utils/formatters';
import { PlaceholderImage } from '../components/common/PlaceholderImage';
import { EmptyState } from '../components/common/EmptyState';

export function CartPage() {
  const { cart, updateCartQty, removeFromCart } = useApp();

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = item.product.sale_price ?? item.product.price;
      return sum + (p * item.quantity);
    }, 0);
  }, [cart]);

  if (cart.length === 0) {
    return <EmptyState title="Your Shopping Cart is Empty" subtitle="Explore our store catalog to add pixel art hardware." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(({ product, quantity }) => (
            <div key={product.id} className="bg-neutral-800/70 border border-neutral-700 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0">
                {product.image_link ? (
                  <img src={product.image_link} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <PlaceholderImage text={product.title} />
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="text-sm font-bold text-white truncate">{product.title}</h3>
                {product.color && <p className="text-xs text-neutral-400">Color: {product.color}</p>}
                <p className="text-xs text-pink-400 font-semibold mt-1">
                  {formatIDR(product.sale_price ?? product.price)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-neutral-700 rounded-lg bg-neutral-900">
                  <button
                    onClick={() => updateCartQty(product.id, quantity - 1)}
                    className="px-2.5 py-1 text-neutral-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => updateCartQty(product.id, quantity + 1)}
                    className="px-2.5 py-1 text-neutral-400 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => removeFromCart(product.id)}
                  className="text-neutral-500 hover:text-red-400 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 h-fit space-y-4">
          <h2 className="text-base font-bold text-white border-b border-neutral-700 pb-3">Order Summary</h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span className="text-white font-medium">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Est. Shipping</span>
              <span className="text-neutral-500 italic">Calculated at Checkout</span>
            </div>
          </div>

          <div className="border-t border-neutral-700 pt-3 flex justify-between items-center text-sm font-bold text-white">
            <span>Total Subtotal</span>
            <span className="text-pink-400 text-lg">{formatIDR(subtotal)}</span>
          </div>

          <Link
            to="/checkout"
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition-transform active:scale-98 shadow-lg block text-center"
          >
            Checkout as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
