# DUITKU POP — Audit Recommendations

> **Status dokumen:** Rekomendasi untuk ditinjau dan disetujui sebelum implementasi  
> **Tanggal audit:** 2026-11-07  
> **Repository:** `alfazarqom/wasowo-02`  
> **Branch:** `main`  
> **Commit yang diperiksa:** `59e5161f7027ceb8f8b13ea1ff309cd7086957b8`  
> **Supabase project:** `mvwflakurihhakdrlteg`  
> **Integrasi:** Duitku POP JavaScript Popup  
> **Ongkir:** Flat **Rp52.000**

Dokumen ini adalah hasil audit dan rancangan requirement. Dokumen ini **tidak mengimplementasikan perubahan**. Kode, migration, database, secrets, dan deployment tidak diubah dalam penyusunan dokumen ini.

---

## 1. Ringkasan

Integrasi telah memiliki alur dasar guest checkout, pembuatan invoice melalui Edge Function, popup Duitku, pemeriksaan status melalui server, dan callback bertanda tangan. Backend juga menghitung ulang harga produk dan ongkir tetap Rp52.000.

**Status kesiapan: belum direkomendasikan untuk produksi** sampai temuan prioritas P1 ditangani dan seluruh acceptance criteria Sandbox dipenuhi.

Fokus perbaikan:

1. Menutup celah callback yang diterima sebelum referensi invoice tersimpan.
2. Menangani hasil Create Invoice yang ambigu (timeout/koneksi terputus) tanpa langsung mengunci transaksi sebagai gagal.
3. Memastikan total yang ditagihkan sama dengan total final yang telah disetujui pembeli.
4. Mengamankan halaman konfirmasi agar hanya menampilkan keberhasilan setelah status server diverifikasi.
5. Memenuhi batas panjang nama item Duitku POP dan memperjelas expiry/reconciliation.
6. Menyelaraskan migration repository dengan objek database Supabase yang benar-benar aktif.

### Batas audit

- Pemeriksaan repository dilakukan terhadap file pada `main`, commit di atas.
- Pemeriksaan database dilakukan secara read-only pada project yang tercantum.
- Tidak ada transaksi pembayaran nyata yang dibuat.
- Tidak ada secret value yang dibaca atau ditampilkan.
- Build, test otomatis, dan skenario Sandbox tidak dijalankan sebagai bagian dari audit ini.
- Temuan kode statis tidak dianggap sebagai bukti bahwa skenario runtime telah terjadi.

---

## 2. Komponen yang diperiksa

### 2.1 Frontend

| Komponen | File | Area pemeriksaan |
|---|---|---|
| Checkout | `src/pages/CheckoutPage.tsx` | Data customer, item cart, total tampilan, request invoice |
| Payment | `src/pages/PaymentPage.tsx` | Popup Duitku, polling status, navigasi setelah paid |
| Payment Return | `src/pages/PaymentReturnPage.tsx` | Pemulihan konteks order dan pembacaan status server |
| Order Success | `src/pages/OrderSuccessPage.tsx` | Validasi status sebelum menampilkan konfirmasi |

### 2.2 Supabase

| Komponen | Nama |
|---|---|
| Edge Function create invoice dan status lookup | `divoom-duitku-create-invoice` |
| Edge Function callback | `divoom-duitku-callback` |
| Orders | `public.divoom_orders` |
| Order items | `public.divoom_order_items` |
| Payment transactions | `public.divoom_payment_transactions` |
| Callback events | `public.divoom_payment_callback_events` |
| Rate limits | `public.divoom_checkout_rate_limits` |
| Callback RPC | `divoom_apply_payment_callback` |
| Rate-limit RPC | `divoom_consume_rate_limit` |
| Reconciliation RPC yang didefinisikan migration | `divoom_reconcile_pending_payment_callbacks` |

### 2.3 Migration dan dokumentasi

- `supabase/migrations/20261107000100_create_divoom_duitku_schema.sql`
- `supabase/migrations/20261107000200_fix_callback_invoice_reference_race.sql`
- `docs/DIVOOM_DUITKU_POP_SETUP.md`
- `.env.example`

### 2.4 Kondisi Supabase yang diamati

Project `mvwflakurihhakdrlteg` teramati berstatus `ACTIVE_HEALTHY`. Kedua Edge Function berstatus aktif, versi 2, dan `verify_jwt=false`. Konfigurasi tanpa JWT sesuai pola endpoint callback/guest checkout publik **hanya jika** validasi internal tetap wajib dan benar.

Snapshot agregat saat audit:

| Objek | Jumlah |
|---|---:|
| `divoom_orders` | 5 |
| `divoom_order_items` | 5 |
| `divoom_payment_transactions` | 5 |
| `divoom_payment_callback_events` | 1 |
| `divoom_checkout_rate_limits` | 6 |

Status payment pada snapshot: 1 `paid`, 4 `pending`. Satu callback event tercatat paid. Tidak ditemukan event `awaiting_invoice_reference` pada snapshot tersebut. Angka ini adalah snapshot saat audit, bukan metrik real-time atau bukti pengujian.

RLS teramati aktif pada tabel transaksi terkait dan tidak ditemukan policy akses langsung untuk `anon`/`authenticated`. RPC callback dan rate-limit teramati menggunakan `SECURITY DEFINER`, fixed `search_path`, dan hak EXECUTE dibatasi ke `service_role`.

**Drift migration:** dua migration yang diperiksa ada di repository, tetapi versi migration tersebut tidak ditemukan pada riwayat migration Supabase yang diperiksa. Objek tabel/RPC sudah ada di database. RPC `divoom_reconcile_pending_payment_callbacks` yang didefinisikan migration tidak ditemukan pada database aktif saat audit. Jangan menjalankan ulang migration sebelum rekonsiliasi schema dan migration history dilakukan.

---

## 3. Temuan terverifikasi

Prioritas:
- **P1 — wajib sebelum produksi:** berpotensi menyebabkan pembayaran tidak tercatat, jumlah tagihan tidak sesuai persetujuan, atau ketidakcocokan transaksi yang kritis.
- **P2 — wajib sebelum peluncuran stabil:** integritas alur, pemulihan, UX, atau operasional belum memadai.
- **P3 — peningkatan:** hardening dan maintainability.

### P1 — Callback yang datang lebih awal belum direkonsiliasi setelah referensi invoice tersimpan

**Bukti repository**

- Migration `20261107000200_fix_callback_invoice_reference_race.sql` mendefinisikan `divoom_reconcile_pending_payment_callbacks` dan mengubah callback RPC agar menyimpan callback sebagai `awaiting_invoice_reference` ketika `duitku_reference` belum tersedia.
- `supabase/functions/divoom-duitku-create-invoice/index.ts` menyimpan referensi provider setelah invoice berhasil dibuat (blok update payment reference).
- Pada fungsi tersebut, setelah penyimpanan referensi berhasil, tidak ditemukan pemanggilan `divoom_reconcile_pending_payment_callbacks`.
- RPC reconciliation tersebut juga tidak ditemukan pada database aktif ketika audit dilakukan.

**Dampak**

Callback valid yang datang sebelum referensi invoice tersimpan dapat tetap berada dalam status menunggu. Penyimpanan referensi berikutnya tidak otomatis memproses callback yang tertunda. Akibatnya, pembayaran yang sebenarnya berhasil berisiko tidak berubah menjadi `paid` di database.

**Requirement perbaikan**

1. Setelah referensi invoice berhasil dipersistenkan, backend harus memproses callback tertunda untuk merchant order yang sama.
2. Proses harus atomik, idempotent, dan memeriksa kembali merchant order ID, amount, reference, signature-verification outcome, serta status transaksi.
3. Jika rekonsiliasi gagal, event harus tetap dapat diproses ulang dan kegagalannya dapat diamati; jangan menghapus atau menganggap event berhasil.
4. Selaraskan function/RPC yang ada di repository dengan database aktif melalui migration terkontrol.

**Acceptance criteria**

- Callback valid yang tiba sebelum reference tersimpan akhirnya mengubah payment dan order ke status yang sesuai setelah reference tersimpan.
- Callback duplikat tidak menerapkan perubahan status dua kali.
- Reference atau amount yang tidak cocok tidak mengubah status transaksi.
- Kegagalan RPC setelah invoice dibuat menghasilkan kondisi yang dapat direkonsiliasi dan tidak menyatakan pembayaran berhasil secara palsu.
- Uji race condition mencakup callback lebih dahulu, penyimpanan reference lebih dahulu, dan callback bersamaan.

### P1 — Kegagalan jaringan Create Invoice dapat menghasilkan status lokal yang terlalu final

**Bukti repository**

Di `supabase/functions/divoom-duitku-create-invoice/index.ts`, kegagalan request provider ditangani dengan mengubah status payment menjadi `invoice_failed`. Kode yang diperiksa tidak menunjukkan pembedaan yang cukup antara penolakan invoice yang definitif dan hasil request yang ambigu, misalnya timeout setelah provider mungkin telah membuat invoice.

RPC callback pada migration hanya menerapkan perubahan payment ketika status masih `pending`; status terminal/selain pending diabaikan.

**Dampak**

Jika Duitku berhasil membuat invoice tetapi respons tidak sampai ke Edge Function, payment lokal dapat ditandai `invoice_failed`. Callback sukses yang datang kemudian berpotensi diabaikan karena status lokal bukan lagi `pending`.

**Requirement perbaikan**

1. Bedakan penolakan provider yang definitif dari timeout, koneksi terputus, atau respons yang tidak dapat dipastikan.
2. Gunakan status internal non-final untuk hasil yang ambigu, misalnya `invoice_creation_unknown`, hanya setelah disepakati sebagai perubahan model status.
3. Sediakan proses rekonsiliasi berdasarkan merchant order ID/reference melalui mekanisme yang benar-benar didukung dokumentasi dan konfigurasi merchant.
4. Jangan membuat invoice kedua secara otomatis untuk merchant order yang hasil invoice pertamanya belum diketahui.
5. Pertahankan callback valid agar dapat menyelesaikan transaksi yang masih berada dalam status ambigu melalui transisi yang disetujui.

**Acceptance criteria**

- Timeout tidak langsung mengubah transaksi menjadi status gagal final.
- Penolakan invoice definitif dapat dibedakan dari hasil tidak diketahui.
- Callback sukses valid setelah timeout tetap dapat diproses sesuai aturan transisi.
- Retry tidak membuat invoice duplikat atau merchant order ID yang tidak terpetakan.
- Semua transisi dan hasil rekonsiliasi tercatat tanpa menyimpan secret.

### P1 — Total backend belum terikat pada persetujuan final pembeli

**Bukti repository**

- `CheckoutPage.tsx` menampilkan subtotal berdasarkan data cart frontend dan ongkir flat Rp52.000.
- Request checkout mengirim customer dan item (`productId`, `quantity`), bukan bukti persetujuan atas total final.
- Edge Function menghitung ulang harga dari data produk dan menambahkan ongkir Rp52.000.

**Dampak**

Harga produk dapat berubah antara tampilan checkout dan proses backend. Backend memang menghitung harga otoritatif, tetapi tidak terlihat adanya langkah yang meminta pembeli menyetujui kembali total final jika hasil hitung backend berbeda dari yang ditampilkan sebelumnya.

**Requirement perbaikan**

1. Backend tetap menjadi sumber harga, subtotal, ongkir, dan total final.
2. Sediakan tahap review/quote yang menghasilkan rincian final dan identitas quote yang tidak dapat dimanipulasi.
3. Tampilkan kembali total final dari backend kepada pembeli sebelum invoice dibuat.
4. Invoice hanya boleh dibuat untuk quote yang disetujui dan belum kedaluwarsa.
5. Validasi ulang quote, harga, kuantitas, dan ketersediaan saat invoice dibuat; jika berubah, minta persetujuan baru.
6. Ongkir tetap flat **Rp52.000**, kecuali ada perubahan bisnis yang disetujui secara terpisah.

**Acceptance criteria**

- Total yang ditampilkan pada tahap persetujuan sama persis dengan amount invoice yang dikirim ke Duitku.
- Perubahan harga/kuantitas/ongkir setelah quote dibuat membatalkan quote atau memerlukan persetujuan ulang.
- Manipulasi total dari browser tidak dapat mengubah amount backend.
- Perhitungan menggunakan integer IDR dan rincian item + ongkir sama dengan payment amount.
- Quote tidak dapat dipakai ulang untuk membuat invoice dengan total berbeda.

### P2 — Halaman Order Success tidak melakukan verifikasi server sendiri

**Bukti repository**

`src/pages/OrderSuccessPage.tsx` menampilkan pesan “Order Payment Confirmed” secara statis. Tidak ada pemanggilan status server atau validasi order pada komponen tersebut. Navigasi normal dari PaymentPage memang hanya menampilkan tombol menuju konfirmasi ketika status server `paid`, tetapi URL halaman konfirmasi dapat dibuka langsung.

**Dampak**

Pengunjung yang membuka URL secara langsung dapat melihat pesan sukses tanpa halaman tersebut memeriksa status order. Ini dapat menimbulkan klaim visual bahwa pembayaran telah terkonfirmasi padahal halaman tidak membuktikannya.

**Requirement perbaikan**

1. OrderSuccessPage harus menerima identifier order yang valid dan meminta status otoritatif dari backend.
2. Tampilkan konfirmasi sukses hanya jika backend mengembalikan status payment `paid`.
3. Untuk status pending/failed/expired atau order tidak ditemukan, tampilkan status yang sesuai; jangan tampilkan pesan sukses.
4. Endpoint status harus memverifikasi pasangan order dan bukti akses guest yang sesuai, serta membatasi kebocoran data.

**Acceptance criteria**

- Membuka URL sukses secara langsung untuk order pending tidak menampilkan konfirmasi sukses.
- Order paid yang valid dapat menampilkan konfirmasi.
- Order tidak ditemukan atau email/token akses tidak cocok tidak membocorkan detail order.
- Query string atau state browser tidak dapat memaksa halaman menampilkan status paid.

### P2 — Nama item pada payload invoice dapat melebihi batas dokumentasi

**Bukti repository**

Create Invoice membentuk `itemDetails.name` dengan pemotongan hingga 255 karakter (`slice(0, 255)`). Dokumentasi resmi POP yang diperiksa menyatakan batas nama item adalah 50 karakter.

**Dampak**

Nama item yang melebihi batas provider berpotensi menyebabkan request ditolak atau diproses tidak konsisten.

**Requirement perbaikan**

1. Normalisasi nama item agar memenuhi batas 50 karakter sesuai dokumentasi POP.
2. Pastikan pemotongan tidak menghasilkan string kosong dan tetap dapat ditelusuri ke produk/order item internal.
3. Pastikan jumlah seluruh itemDetails, termasuk ongkir, sama dengan paymentAmount.

**Acceptance criteria**

- Tidak ada `itemDetails.name` yang melebihi 50 karakter.
- Nama item kosong ditolak atau diganti dengan label fallback yang disetujui.
- Jumlah `price × quantity` seluruh itemDetails sama dengan amount invoice.
- Pengujian produk dengan nama sangat panjang berhasil melewati validasi payload.

### P2 — Expiry dan pemulihan transaksi belum memiliki kontrak operasional lengkap

**Bukti repository/database**

Schema mengenal status `expired`, tetapi fungsi create invoice yang diperiksa tidak menunjukkan konfigurasi expiry yang eksplisit. Audit database juga tidak menemukan RPC reconciliation bernama `divoom_reconcile_pending_payment_callbacks`. Tidak ada bukti yang cukup dalam audit ini bahwa proses expiry otomatis dan rekonsiliasi status provider sudah berjalan.

**Dampak**

Order pending dapat tertahan tanpa batas yang terdefinisi. Penanganan callback terlambat, status provider yang berbeda, dan pemulihan transaksi setelah gangguan belum dapat dinyatakan selesai.

**Requirement perbaikan**

1. Tetapkan masa berlaku pembayaran berdasarkan dukungan POP/konfigurasi merchant yang diverifikasi; jangan menebak parameter atau satuannya.
2. Definisikan aturan transisi pending → expired dan penanganan callback sukses yang datang terlambat.
3. Tentukan proses rekonsiliasi dan pemilik operasionalnya.
4. Jika fitur inquiry/status provider tidak didukung untuk integrasi/akun yang digunakan, dokumentasikan mekanisme alternatif yang disetujui; jangan mengarang endpoint.
5. Tentukan kebijakan refund/manual review untuk pembayaran terlambat yang tidak dapat dipenuhi.

**Acceptance criteria**

- Masa berlaku transaksi dan sumber penentu expiry terdokumentasi dan telah diverifikasi.
- Transaksi tidak menjadi expired hanya berdasarkan timer browser.
- Callback terlambat ditangani dengan aturan bisnis eksplisit dan audit trail.
- Rekonsiliasi dapat dijalankan ulang tanpa menggandakan efek.
- Status lokal tidak diklaim sebagai bukti refund provider.

### P2 — Model inventory hanya memeriksa availability, bukan reservasi kuantitas

**Bukti repository**

Create Invoice memeriksa `availability = 'in stock'`. Migration `divoom_products` yang menjadi sumber produk tidak menambahkan kuantitas stok atau mekanisme reservasi. Dokumen setup juga menyatakan bahwa implementasi ini tidak melakukan reserve/decrement stock.

**Dampak**

Jika bisnis memerlukan pengendalian jumlah unit, dua checkout bersamaan dapat sama-sama lolos pemeriksaan availability. Status availability saja tidak menjamin jumlah unit tersedia.

**Requirement perbaikan**

1. Konfirmasi apakah produk Wasowo-02 membutuhkan stok kuantitatif atau hanya flag availability.
2. Jika kuantitatif, audit model SKU/varian dan sumber stok yang sebenarnya sebelum merancang reservation/ledger.
3. Tetapkan kapan stok direservasi, dikurangi, dilepas, dan dipulihkan.
4. Jalankan perubahan stok secara atomik dan idempotent mengikuti callback terverifikasi.
5. Jangan menambahkan tabel stok/reservasi baru sebelum model data dan kebutuhannya disetujui.

**Acceptance criteria**

- Model stok dan sumber kebenarannya terdokumentasi.
- Dua checkout bersamaan tidak dapat menjual melebihi stok jika stok kuantitatif diwajibkan.
- Callback duplikat tidak mengurangi stok dua kali.
- Pembayaran gagal/expired/cancelled tidak melepas atau memulihkan stok dua kali.
- Jika bisnis hanya menggunakan flag availability, batasan ini dinyatakan eksplisit dan diterima.

### P2 — Migration repository dan schema aktif Supabase belum sinkron

**Bukti database/repository**

Migration 2026-11-07 ditemukan di repository tetapi tidak ditemukan pada riwayat migration aktif yang diperiksa. Tabel dan beberapa RPC telah ada pada database. RPC reconciliation yang ada di migration tidak ditemukan pada database aktif saat audit.

**Dampak**

Menjalankan migration secara langsung tanpa membandingkan schema dapat menghasilkan drift lebih lanjut, gagal sebagian, atau membuat asumsi deployment yang salah.

**Requirement perbaikan**

1. Buat perbandingan eksplisit antara migration history, schema aktif, definisi function/RPC, grants, constraints, indexes, dan RLS.
2. Identifikasi objek yang dibuat manual atau melalui jalur lain.
3. Siapkan migration rekonsiliasi yang aman dan idempotent sesuai hasil diff; jangan sekadar menjalankan ulang file lama.
4. Simpan bukti hasil verifikasi sebelum dan sesudah perubahan.

**Acceptance criteria**

- Semua objek transaksi yang diperlukan tercatat dalam migration history atau memiliki dokumentasi asal-usul yang disetujui.
- Definisi RPC, signature, grants, dan `search_path` di database sama dengan versi yang disetujui.
- Migration diuji pada environment non-production terlebih dahulu.
- Tidak ada tabel, function, policy, atau data yang dihapus/ditimpa tanpa persetujuan eksplisit.

### P3 — Konteks Payment Return bergantung pada localStorage

**Bukti repository**

`PaymentPage.tsx` dan `PaymentReturnPage.tsx` mengambil merchant order ID/reference/email dari `localStorage` key `divoom_pending_payment`. Jika storage hilang, diblokir, atau pengguna berpindah browser/perangkat, pemulihan status melalui halaman tersebut tidak dapat dilakukan dengan konteks yang tersedia.

**Requirement perbaikan**

- Sediakan mekanisme lookup guest yang aman dan tidak mengandalkan reference Duitku di browser.
- Gunakan identifier order dan mekanisme verifikasi akses yang disetujui.
- Jangan menjadikan localStorage sebagai sumber kebenaran status pembayaran.

**Acceptance criteria**

- Status order dapat dipulihkan melalui mekanisme guest lookup yang sah meskipun localStorage kosong.
- Tidak ada akses order hanya dengan menebak merchant order ID.
- Reference provider dan secret tidak diperlukan di browser untuk membaca status.

---

## 4. Kontrak integrasi yang direkomendasikan

Kontrak berikut adalah target requirement yang perlu disetujui. Ini bukan klaim bahwa seluruh kontrak telah diimplementasikan.

### 4.1 Frontend → backend: checkout quote

**Tujuan:** memperoleh rincian harga otoritatif sebelum pembeli menyetujui total.

Contoh bentuk request:

```json
{
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "08xxxxxxxxxx",
    "address": "Street address",
    "city": "City"
  },
  "items": [
    {
      "productId": "product-id",
      "quantity": 2
    }
  ]
}
```

Backend wajib mengambil ulang harga, sale price, availability, dan identitas produk dari database. Backend menghitung subtotal dan ongkir flat Rp52.000.

Contoh bentuk response yang direkomendasikan:

```json
{
  "success": true,
  "data": {
    "quoteId": "server-generated-quote-id",
    "currency": "IDR",
    "items": [
      {
        "productId": "product-id",
        "name": "Product name",
        "unitPrice": 100000,
        "quantity": 2,
        "lineTotal": 200000
      }
    ],
    "subtotal": 200000,
    "shippingCost": 52000,
    "totalAmount": 252000,
    "expiresAt": "ISO-8601 timestamp"
  }
}
```

Quote ID, expiry, dan persistensi quote adalah requirement desain yang perlu disepakati sebelum implementasi.

### 4.2 Frontend → backend: persetujuan dan pembuatan invoice

Invoice dibuat hanya setelah pembeli menyetujui total dari quote yang masih valid.

Contoh bentuk request:

```json
{
  "quoteId": "server-generated-quote-id",
  "acceptedTotalAmount": 252000
}
```

Backend wajib:
- Memastikan quote milik checkout yang sama dan belum kedaluwarsa.
- Memvalidasi ulang harga, quantity, availability, subtotal, ongkir, dan total.
- Menolak jika accepted total tidak sama dengan total server.
- Membuat merchant order ID unik.
- Membuat invoice ke endpoint POP sesuai environment server.
- Menyimpan hasil invoice/reference secara konsisten sebelum mengembalikan instruksi pembayaran.

Contoh bentuk response sukses:

```json
{
  "success": true,
  "data": {
    "merchantOrderId": "unique-merchant-order-id",
    "reference": "duitku-reference",
    "paymentScriptEnvironment": "sandbox",
    "paymentAmount": 252000,
    "paymentStatus": "pending"
  }
}
```

Response tidak boleh mengandung API key, service-role key, signature rahasia, atau diagnostic internal.

### 4.3 Frontend → backend: status order/payment

Saat ini status lookup dilakukan melalui GET pada Edge Function create-invoice dengan parameter `merchantOrderId` dan `email`. Pemisahan endpoint status dari endpoint create invoice direkomendasikan untuk kejelasan kontrak, tetapi perubahan route harus menjaga kompatibilitas caller yang ada.

Contoh bentuk response:

```json
{
  "success": true,
  "data": {
    "merchantOrderId": "unique-merchant-order-id",
    "orderStatus": "pending_payment",
    "paymentStatus": "pending",
    "paymentAmount": 252000,
    "paidAt": null
  }
}
```

Ketentuan:
- Endpoint status bersifat read-only.
- Verifikasi guest access harus konsisten dan tidak hanya mengandalkan identifier yang mudah ditebak.
- Polling/status refresh tidak boleh mengubah status payment atau inventory.
- Browser tidak dapat mengirim status `paid` untuk ditulis ke database.

### 4.4 Duitku → backend: HTTP callback

**Kontrak yang diverifikasi dari dokumentasi POP:**
- HTTP POST.
- Content type `application/x-www-form-urlencoded`.
- Validasi merchant code.
- Verifikasi signature callback menggunakan HMAC-SHA256 dari gabungan `merchantCode + amount + merchantOrderId` dengan API key.
- Validasi amount dan merchant order ID terhadap transaksi lokal.
- Callback diproses secara idempotent.
- `resultCode=00` merupakan hasil sukses; kode hasil lain dipetakan sesuai dokumentasi dan aturan bisnis yang diverifikasi.
- Return URL dan JavaScript popup event bukan bukti pembayaran.

Callback harus:
1. Memvalidasi field wajib dan format payload.
2. Memverifikasi signature sebelum mutasi data.
3. Memastikan merchant order ID, amount, reference, dan transaksi cocok.
4. Memproses transisi status melalui RPC/transaksi database yang atomik.
5. Menyimpan event untuk idempotency dan audit trail.
6. Mengembalikan respons callback yang sesuai kontrak provider hanya setelah event ditangani dengan aman. Kegagalan pemrosesan harus dapat di-retry/reconcile.

### 4.5 Status dan transisi

Status aktual yang terlihat pada schema mencakup `pending`, `paid`, `failed`, `expired`, dan `invoice_failed`. Status tambahan untuk hasil invoice ambigu tidak boleh ditambahkan tanpa persetujuan perubahan schema.

Aturan target:

| Kondisi | Payment | Order | Catatan |
|---|---|---|---|
| Invoice berhasil dibuat | pending | pending_payment | Menunggu callback terverifikasi |
| Callback sukses valid | paid | paid | Efek hanya sekali |
| Callback gagal valid | failed | payment_failed | Ikuti result code POP yang terverifikasi |
| Masa pembayaran habis | expired | expired | Berdasarkan aturan expiry yang disetujui |
| Hasil pembuatan invoice tidak diketahui | status non-final yang disetujui | pending/review | Tidak boleh dianggap gagal final tanpa rekonsiliasi |
| Callback duplikat | tidak berubah | tidak berubah | Idempotent |
| Signature/amount/reference salah | tidak berubah | tidak berubah | Tolak dan catat secara aman |

Order status dan payment status tetap merupakan dua konsep terpisah.

---

## 5. Persyaratan keamanan dan operasional

1. Duitku API key dan Supabase service-role key hanya berada di secret manager/backend.
2. Tidak ada secret dalam source frontend, response browser, log, atau migration SQL.
3. Endpoint publik yang menggunakan `verify_jwt=false` wajib memvalidasi input, signature (untuk callback), akses guest, rate limit, dan batas data yang dikembalikan.
4. RLS tetap aktif; akses transaksi langsung dari anon/authenticated tidak dibuka hanya untuk memudahkan integrasi.
5. RPC `SECURITY DEFINER` wajib memakai `search_path` tetap, schema qualification, dan EXECUTE privilege minimum.
6. Semua nilai uang menggunakan integer IDR.
7. Callback, status reconciliation, expiry, dan inventory side effects harus idempotent.
8. Log hanya menyimpan informasi diagnostik minimum; jangan menyimpan API key, signature mentah, atau data pribadi yang tidak diperlukan.
9. Environment Sandbox dan production harus dipasangkan dengan credential, endpoint, callback URL, dan popup script environment yang benar.
10. Tidak ada real payment atau deployment production selama tahap pengujian.

---

## 6. Acceptance criteria lintas sistem

Implementasi baru dapat dinyatakan memenuhi requirement setelah seluruh kriteria relevan di bawah diuji dan bukti hasilnya dicatat.

### Invoice dan amount

- [ ] Backend mengambil harga dan availability dari sumber database otoritatif.
- [ ] Pembeli menyetujui total final sebelum invoice dibuat.
- [ ] Total invoice sama dengan total quote yang disetujui.
- [ ] Ongkir flat Rp52.000 diterapkan tepat satu kali.
- [ ] Semua nilai uang berupa integer IDR.
- [ ] Jumlah seluruh itemDetails sama dengan paymentAmount.
- [ ] Nama item tidak melebihi batas POP yang terdokumentasi.

### Signature dan callback

- [ ] Request signature mengikuti dokumentasi Create Invoice terkini.
- [ ] Callback hanya diproses setelah signature valid.
- [ ] Callback salah signature, merchant code, amount, merchant order ID, atau reference tidak mengubah status.
- [ ] Callback sukses valid mengubah payment/order secara konsisten.
- [ ] Callback gagal valid dipetakan sesuai result code dan aturan bisnis.
- [ ] Callback duplikat tidak menggandakan efek.
- [ ] Callback yang datang sebelum reference tersimpan berhasil direkonsiliasi.
- [ ] Kegagalan RPC tidak menghasilkan HTTP sukses palsu untuk event yang belum diproses.

### Status, expiry, dan guest access

- [ ] Browser redirect/JS callback tidak dapat mengubah status payment.
- [ ] PaymentPage dan PaymentReturnPage hanya menampilkan status dari backend.
- [ ] OrderSuccessPage memverifikasi status server sendiri.
- [ ] Order pending/failed/expired tidak menampilkan pesan sukses.
- [ ] Guest lookup memverifikasi bukti akses dan tidak membocorkan data order.
- [ ] Expiry dan callback terlambat memiliki aturan transisi yang diuji.
- [ ] Hasil invoice yang ambigu dapat dipulihkan tanpa membuat invoice duplikat.

### Database dan inventory

- [ ] Migration history cocok dengan schema dan RPC aktif.
- [ ] RLS, grants, RPC privileges, dan `search_path` diverifikasi.
- [ ] Payment/order transition atomik dan idempotent.
- [ ] Model stok telah diputuskan dan terdokumentasi.
- [ ] Jika stok kuantitatif berlaku, concurrent checkout tidak oversell.
- [ ] Tidak ada decrement/release stok ganda.

### Quality gates

- [ ] TypeScript/build berhasil.
- [ ] Lint dan test otomatis yang tersedia berhasil.
- [ ] Sandbox happy path berhasil.
- [ ] Seluruh skenario negatif dan race condition di bawah diuji.
- [ ] Bukti test mencantumkan environment, waktu, hasil aktual, dan referensi transaksi uji yang aman.
- [ ] Tidak ada pembayaran nyata atau deployment production tanpa persetujuan eksplisit.

---

## 7. Matriks pengujian yang wajib disiapkan

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| T01 | Invoice valid | Invoice Sandbox dibuat dan reference tersimpan |
| T02 | API key/merchant code tidak tersedia | Request gagal tertutup; tidak ada invoice palsu |
| T03 | Signature callback valid, result sukses | Payment dan order menjadi paid |
| T04 | Signature callback salah | Ditolak; status tidak berubah |
| T05 | Amount tidak cocok | Ditolak; status tidak berubah |
| T06 | Merchant order ID/reference tidak cocok | Ditolak; status tidak berubah |
| T07 | Callback duplikat | Efek hanya sekali |
| T08 | Callback tiba sebelum reference tersimpan | Event direkonsiliasi setelah reference tersimpan |
| T09 | Dua callback bersamaan | Tidak ada double transition |
| T10 | Timeout setelah request invoice dikirim | Status tidak difinalisasi sebagai gagal tanpa kepastian |
| T11 | Provider menolak invoice secara definitif | Error dipetakan dengan aman |
| T12 | Callback sukses setelah timeout | Status dapat diselesaikan sesuai transisi yang disetujui |
| T13 | Harga berubah setelah quote | Quote ditolak atau persetujuan ulang diminta |
| T14 | Nama produk lebih dari 50 karakter | Payload memenuhi batas dokumentasi |
| T15 | OrderSuccess URL dibuka langsung untuk pending | Tidak menampilkan konfirmasi sukses |
| T16 | LocalStorage kosong | Guest status recovery tetap tersedia melalui jalur aman |
| T17 | Order/email/access proof tidak cocok | Tidak membocorkan data order |
| T18 | Callback dan expiry bersamaan | Satu transisi final yang sah; tidak ada status mundur |
| T19 | Dua checkout untuk stok terakhir | Tidak oversell jika stok kuantitatif diberlakukan |
| T20 | Sandbox/production mismatch | Gagal tertutup dan tidak mengirim transaksi ke environment salah |

---

## 8. Rencana perbaikan yang diusulkan

Urutan ini adalah rekomendasi, bukan izin implementasi.

| Tahap | Cakupan | Hasil yang harus diserahkan |
|---|---|---|
| 1. Konfirmasi requirement | Quote/approval total, expiry, stok, guest lookup, status transitions | Requirement final yang disetujui |
| 2. Rekonsiliasi database | Migration history, schema diff, RPC, grants, RLS | Schema/migration reconciliation plan |
| 3. Perbaikan callback race | Create-invoice, callback RPC, reconciliation RPC | Race-safe callback flow |
| 4. Perbaikan invoice ambiguity | Invoice error classification dan recovery | No false-terminal invoice state |
| 5. Final amount approval | Quote/approval contract dan CheckoutPage | Approved amount bound to invoice |
| 6. Status dan success page | PaymentPage, PaymentReturnPage, OrderSuccessPage, guest status contract | Server-authoritative UI |
| 7. POP payload/expiry | itemDetails validation, expiry behavior | Provider-compliant invoice payload |
| 8. Sandbox verification | Automated/integration tests dan skenario T01–T20 | Test evidence dan release checklist |

### File/objek yang kemungkinan masuk scope implementasi

Daftar ini perlu dikonfirmasi setelah desain disetujui:

- `src/pages/CheckoutPage.tsx`
- `src/pages/PaymentPage.tsx`
- `src/pages/PaymentReturnPage.tsx`
- `src/pages/OrderSuccessPage.tsx`
- `supabase/functions/divoom-duitku-create-invoice/index.ts`
- `supabase/functions/divoom-duitku-callback/index.ts`
- Migration baru untuk perubahan schema/RPC yang benar-benar diperlukan
- Test fixtures dan automated tests untuk invoice/callback/status transitions

Tidak ada objek di atas yang diubah oleh dokumen ini.

---

## 9. Belum terverifikasi

Hal berikut belum dapat dinyatakan lulus berdasarkan audit ini:

- Build/typecheck/test suite pada commit yang diperiksa.
- Perilaku aktual callback race dan timeout dengan provider Sandbox.
- Apakah credential Sandbox dan production sudah dipasangkan dengan benar; nilai secret tidak diperiksa.
- Konfigurasi callback URL/return URL pada dashboard merchant Duitku.
- Kebijakan expiry yang aktif pada akun merchant dan dukungan parameter expiry untuk request yang digunakan.
- Mekanisme status inquiry/reconciliation provider yang tersedia untuk akun dan integrasi ini.
- Kebijakan bisnis untuk pembayaran terlambat, refund, dan stok.
- Apakah stok kuantitatif dibutuhkan atau flag availability memang sudah merupakan model bisnis final.
- Kesesuaian penuh schema aktif terhadap seluruh migration di luar objek yang diperiksa.

---

## 10. Sumber dan bukti

### Repository

Commit yang diperiksa:

`59e5161f7027ceb8f8b13ea1ff309cd7086957b8`

File utama:
- `src/pages/CheckoutPage.tsx`
- `src/pages/PaymentPage.tsx`
- `src/pages/PaymentReturnPage.tsx`
- `src/pages/OrderSuccessPage.tsx`
- `supabase/functions/divoom-duitku-create-invoice/index.ts`
- `supabase/functions/divoom-duitku-callback/index.ts`
- `supabase/migrations/20261107000100_create_divoom_duitku_schema.sql`
- `supabase/migrations/20261107000200_fix_callback_invoice_reference_race.sql`
- `docs/DIVOOM_DUITKU_POP_SETUP.md`

### Dokumentasi resmi Duitku

Sumber utama dan satu-satunya acuan kontrak provider:

- https://docs.duitku.com/pop/id/

Bagian yang diperiksa pada 2026-11-07: Create Invoice, Callback, Duitku JS, dan Redirect.

Ketentuan provider seperti endpoint, header, signature, batas field, result code, dan behavior callback wajib diverifikasi kembali terhadap dokumentasi resmi sebelum implementasi karena dokumentasi/provider dapat berubah.

---

## 11. Keputusan yang diperlukan sebelum implementasi

Mohon persetujuan terpisah untuk hal-hal berikut:

1. **Quote dan persetujuan total:** apakah checkout harus menampilkan quote final dari backend dan meminta persetujuan eksplisit sebelum invoice?
2. **Expiry:** berapa lama pembayaran berlaku, berdasarkan opsi yang benar-benar didukung POP/merchant?
3. **Inventory:** apakah Wasowo-02 membutuhkan stok kuantitatif/reservasi atau hanya flag `availability`?
4. **Guest order lookup:** mekanisme bukti akses apa yang disetujui selain ketergantungan pada localStorage?
5. **Status invoice ambigu:** apakah penambahan status internal non-final untuk timeout/hasil tidak diketahui disetujui?
6. **Migration reconciliation:** apakah boleh disiapkan migration baru setelah schema aktif dan migration history dibandingkan secara lengkap?

**Batas persetujuan:** persetujuan dokumen ini hanya menyetujui requirement/desain yang disebutkan secara eksplisit. Persetujuan ini tidak otomatis mengizinkan perubahan source code, schema/data database, secrets, konfigurasi provider, atau deployment.

---

## 12. Kesimpulan

Integrasi telah memiliki fondasi POP yang relevan, tetapi masih ada gap penting pada callback race, hasil Create Invoice yang ambigu, persetujuan total final, dan verifikasi halaman sukses. Selain itu, sinkronisasi migration dan kebijakan expiry/stok perlu diputuskan.

**Rekomendasi:** setujui requirement dan kontrak integrasi terlebih dahulu. Setelah itu siapkan implementation plan per file/RPC/migration beserta rollback plan dan test plan. Implementasi baru dimulai setelah scope spesifik disetujui.
