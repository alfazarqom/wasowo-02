import React from 'react';

export function ContactPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Hubungi Asri Collection</h1>
        <p className="text-xs text-neutral-400">Silakan hubungi kami untuk pertanyaan produk, pesanan, dan pembayaran.</p>
      </div>
      <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 space-y-4 text-xs">
        <div>
          <span className="font-bold text-white block">Telepon / WhatsApp</span>
          <a className="text-neutral-400 hover:text-white" href="tel:+6281234336327">+6281234336327</a>
        </div>
        <div>
          <span className="font-bold text-white block">Email</span>
          <a className="text-neutral-400 hover:text-white" href="mailto:asricollections82@gmail.com">asricollections82@gmail.com</a>
        </div>
        <div>
          <span className="font-bold text-white block">Alamat</span>
          <span className="text-neutral-400">Sidenreng Rappang, Sulawesi Selatan</span>
        </div>
      </div>
    </div>
  );
}
