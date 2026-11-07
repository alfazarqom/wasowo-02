import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatIDR } from '../utils/formatters';
import { EDGE_FUNCTIONS } from '../config/backend';

export function CheckoutPage() {
  const { cart, clearCart, showToast } = useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const subtotal = cart.reduce((sum, item) => sum + ((item.product.sale_price ?? item.product.price) * item.quantity), 0);
  const shippingCost = 52000;
  const totalAmount = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || cart.length === 0) return;
    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim()) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(EDGE_FUNCTIONS.duitkuCheckout, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          expectedTotalAmount: totalAmount
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success || !payload?.data?.reference || !payload?.data?.merchantOrderId) {
        throw new Error(payload?.error || 'Unable to create payment invoice.');
      }

      localStorage.setItem('divoom_pending_payment', JSON.stringify({
        merchantOrderId: payload.data.merchantOrderId,
        reference: payload.data.reference,
        email: formData.email.trim().toLowerCase(),
        environment: payload.data.paymentScriptEnvironment
      }));
      clearCart();
      navigate(`/payment/${payload.data.merchantOrderId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed. Please try again.';
      setFormError(message);
      showToast(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Guest Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4 bg-neutral-800/60 border border-neutral-700 rounded-xl p-6">
          <h2 className="text-base font-bold text-white mb-4">Shipping Contact Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Full Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Email Address *</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">City / Region</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-pink-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-300 font-medium mb-1">Street Address *</label>
              <textarea
                required
                rows={3}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-pink-500"
              ></textarea>
            </div>
          </div>

          {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
          <button
            type="submit"
            disabled={submitting || cart.length === 0}
            className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-transform active:scale-98 shadow-lg mt-4"
          >
            {submitting ? 'Preparing secure payment…' : 'Continue to Duitku Payment →'}
          </button>
        </form>

        {/* Mini Cart Summary */}
        <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 h-fit space-y-4">
          <h2 className="text-base font-bold text-white border-b border-neutral-700 pb-3">Cart Total</h2>
          <div className="space-y-2 text-xs">
            {cart.map(item => (
              <div key={item.product.id} className="flex justify-between text-neutral-300">
                <span className="truncate max-w-[180px]">{item.product.title} (x{item.quantity})</span>
                <span>{formatIDR((item.product.sale_price ?? item.product.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-700 pt-3 flex justify-between text-neutral-300 text-xs">
            <span>Subtotal</span><span>{formatIDR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-300 text-xs">
            <span>Flat Shipping</span><span>{formatIDR(shippingCost)}</span>
          </div>
          <div className="border-t border-neutral-700 pt-3 flex justify-between font-bold text-white text-sm">
            <span>Total Payment</span>
            <span className="text-pink-400">{formatIDR(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
