import React from 'react';
import { Link } from 'react-router-dom';

export function Footer({ isMinimal = false }: { isMinimal?: boolean }) {
  if (isMinimal) {
    return (
      <footer className="bg-neutral-900 border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} Divoom Storefront. All rights reserved. Guest Mode Active.
      </footer>
    );
  }

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 select-none">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow">
                D
              </div>
              <span className="font-bold text-base tracking-tight text-white tracking-widest uppercase">
                DIVOOM<span className="text-pink-500">.STORE</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Inovasi terdepan perangkat audio retro, layar LED pixel art interaktif, dan aksesoris estetika modern bergaransi resmi.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Official Storefront Indonesia
              </span>
            </div>
          </div>

          {/* Column 2: Navigasi Cepat (Existing Items Preserved) */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Navigasi Produk</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Home Storefront</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Semua Produk</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Kategori Produk</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist Tersimpan</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order Lookup</Link></li>
              <li><Link to="/tracking" className="hover:text-white transition-colors">Shipment Tracking</Link></li>
            </ul>
          </div>

          {/* Column 3: Informasi (Required Group) */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Informasi</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about-us" className="hover:text-pink-400 transition-colors">Tentang Kami</Link></li>
              <li><Link to="/contact-us" className="hover:text-pink-400 transition-colors">Hubungi Kami</Link></li>
              <li><Link to="/faq" className="hover:text-pink-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 4: Bantuan Pelanggan (Required Group) */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Bantuan Pelanggan</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/terms-and-conditions" className="hover:text-pink-400 transition-colors">Syarat dan Ketentuan</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-pink-400 transition-colors">Kebijakan Privasi</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-pink-400 transition-colors">Kebijakan Pengiriman</Link></li>
              <li><Link to="/payment-policy" className="hover:text-pink-400 transition-colors">Kebijakan Pembayaran</Link></li>
              <li><Link to="/return-refund-policy" className="hover:text-pink-400 transition-colors">Kebijakan Pengembalian dan Pengembalian Dana</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-pink-400 transition-colors">Kebijakan Pembatalan</Link></li>
              <li><Link to="/warranty-policy" className="hover:text-pink-400 transition-colors">Kebijakan Garansi</Link></li>
            </ul>
          </div>

          {/* Column 5: Backend Status & Keamanan (Existing Items Preserved) */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Keamanan Transaksi</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Pembayaran terproteksi Duitku POP & Supabase Edge Functions <code className="text-pink-400 font-mono text-[10px]">get-divoom-products</code>.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-[11px] text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Guest Checkout Ready
              </div>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-[11px] text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                Flat Ongkir Rp 52.000
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-neutral-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Divoom Storefront. All rights reserved. Guest Mode Active.</p>
          <div className="flex flex-wrap gap-4 text-[11px]">
            <Link to="/terms-and-conditions" className="hover:text-neutral-400 transition-colors">Syarat & Ketentuan</Link>
            <Link to="/privacy-policy" className="hover:text-neutral-400 transition-colors">Kebijakan Privasi</Link>
            <Link to="/contact-us" className="hover:text-neutral-400 transition-colors">Kontak</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
