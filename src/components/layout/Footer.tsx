import React from 'react';
import { Link } from 'react-router-dom';

export function Footer({ isMinimal = false }: { isMinimal?: boolean }) {
  if (isMinimal) {
    return (
      <footer className="bg-neutral-900 border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} Asri Collection. All rights reserved.
      </footer>
    );
  }

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="space-y-3 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 select-none">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow">A</div>
              <span className="font-bold text-base tracking-tight text-white tracking-widest uppercase">ASRI COLLECTION</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Asri Collection — toko online yang berlokasi di Sidenreng Rappang, Sulawesi Selatan.
            </p>
            <div className="space-y-1 text-xs">
              <p><a className="hover:text-white" href="tel:+6281234336327">+6281234336327</a></p>
              <p><a className="hover:text-white" href="mailto:asricollections82@gmail.com">asricollections82@gmail.com</a></p>
              <p>Sidenreng Rappang, Sulawesi Selatan</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Navigasi Produk</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/">Home Storefront</Link></li>
              <li><Link to="/products">Semua Produk</Link></li>
              <li><Link to="/categories">Kategori Produk</Link></li>
              <li><Link to="/wishlist">Wishlist Tersimpan</Link></li>
              <li><Link to="/orders">Order Lookup</Link></li>
              <li><Link to="/tracking">Shipment Tracking</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Informasi</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about-us">Tentang Kami</Link></li>
              <li><Link to="/contact-us">Hubungi Kami</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Bantuan Pelanggan</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/terms-and-conditions">Syarat dan Ketentuan</Link></li>
              <li><Link to="/privacy-policy">Kebijakan Privasi</Link></li>
              <li><Link to="/shipping-policy">Kebijakan Pengiriman</Link></li>
              <li><Link to="/payment-policy">Kebijakan Pembayaran</Link></li>
              <li><Link to="/return-refund-policy">Kebijakan Pengembalian dan Pengembalian Dana</Link></li>
              <li><Link to="/cancellation-policy">Kebijakan Pembatalan</Link></li>
              <li><Link to="/warranty-policy">Kebijakan Garansi</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Keamanan Transaksi</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Pembayaran diproses melalui Duitku POP dan Supabase Edge Functions.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-[11px] text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Guest Checkout
              </div>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-[11px] text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Ongkir Rp 52.000
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Asri Collection. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 text-[11px]">
            <Link to="/terms-and-conditions">Syarat & Ketentuan</Link>
            <Link to="/privacy-policy">Kebijakan Privasi</Link>
            <Link to="/contact-us">Kontak</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
