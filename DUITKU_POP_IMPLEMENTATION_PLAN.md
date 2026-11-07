# DUITKU POP — Implementation Plan

> **Status:** Draft implementation plan — requirement baseline approved; implementation not authorized  
> **Tanggal:** 2026-11-07  
> **Repository:** `alfazarqom/wasowo-02`  
> **Branch target:** `main`  
> **Baseline audit:** commit `59e5161f7027ceb8f8b13ea1ff309cd7086957b8`  
> **Audit recommendation document:** [DUITKU_POP_AUDIT_RECOMMENDATIONS.md](./DUITKU_POP_AUDIT_RECOMMENDATIONS.md)  
> **Supabase project observed during audit:** `mvwflakurihhakdrlteg`  
> **Integration mode:** Duitku POP JavaScript Popup  
> **Database prefix:** `divoom_`  
> **Edge Function prefix:** `divoom-`  
> **Shipping:** flat Rp52.000

Dokumen ini merinci urutan, komponen, kontrak, pengujian, dan batas perubahan yang direncanakan. Dokumen ini **bukan izin implementasi**. Tidak ada source code, migration, database, secrets, konfigurasi merchant, atau deployment yang diubah saat dokumen ini disusun.

---

## 1. Keputusan requirement yang telah disetujui

| Area | Keputusan baseline |
|---|---|
| Final amount | Backend menghasilkan quote final; pembeli menyetujui total sebelum invoice dibuat. |
| Callback race | Callback sebelum reference tersimpan harus disimpan dan direkonsiliasi secara idempotent. |
| Invoice timeout | Hasil ambigu tidak boleh langsung dianggap gagal final; recovery tidak boleh membuat invoice duplikat. |
| Success page | Status sukses harus diverifikasi dari backend saat halaman dibuka. |
| Item name | `itemDetails.name` maksimal 50 karakter sesuai batas POP yang diaudit. |
| Expiry | Mengikuti konfigurasi merchant. Nilai belum ditetapkan; jangan mengirim `expiryPeriod` eksplisit sampai konfigurasi/keputusan merchant diverifikasi. |
| Guest order lookup | Ditunda sebagai dependency implementasi. Tidak boleh menganggap merchant order ID + email atau localStorage sebagai mekanisme akses yang sudah disetujui. |
| Inventory | Stok kuantitatif ditunda. Pertahankan pemeriksaan `availability` yang ada sampai model stok bisnis dikonfirmasi. |
| Database migrations | Rekonsiliasi migration history dan schema aktif sebelum migration baru dijalankan. |
| Shipping | Rp52.000 flat, diterapkan satu kali. |

Persetujuan baseline ini tidak mencakup deployment, perubahan secret, real payment, atau mutasi production.

## 2. Tujuan dan hasil implementasi

Implementasi yang kelak disetujui harus menghasilkan:

1. Harga, availability, subtotal, ongkir, dan total yang ditentukan backend.
2. Persetujuan pembeli yang terikat ke quote final yang belum kedaluwarsa.
3. Invoice POP yang menggunakan payload dan signature sesuai dokumentasi resmi untuk mode Popup.
4. Callback server yang tervalidasi, idempotent, dapat direkonsiliasi, dan tahan terhadap race condition.
5. Penanganan timeout Create Invoice yang tidak menghasilkan status gagal palsu atau invoice ganda.
6. Halaman pembayaran, return, dan sukses yang hanya menampilkan status dari backend.
7. Schema, migration history, RPC, grants, dan RLS yang konsisten.
8. Bukti build, test, dan Sandbox sebelum release readiness dinilai.

## 3. Batas scope

### Termasuk dalam rencana

- Checkout quote dan persetujuan total.
- Perbaikan Create Invoice dan klasifikasi hasil provider.
- Callback race dan reconciliation.
- Perbaikan PaymentPage, PaymentReturnPage, dan OrderSuccessPage.
- Validasi payload POP, termasuk batas nama item.
- Migration/schema reconciliation.
- Automated tests dan Sandbox verification.
- Dokumentasi konfigurasi dan recovery.

### Tidak termasuk / ditunda

- Implementasi guest order lookup final sampai mekanisme autentikasi guest diputuskan.
- Stok kuantitatif, reservation, stock ledger, atau decrement quantity.
- Pengiriman email OTP atau one-time link.
- Refund otomatis atau integrasi refund provider yang belum diverifikasi.
- Provider inquiry/status endpoint yang belum diverifikasi untuk akun dan integrasi merchant.
- Rotasi atau perubahan secrets.
- Real payment, deployment production, atau perubahan konfigurasi dashboard merchant.
- Perubahan produk/katalog yang tidak diperlukan untuk kontrak checkout.

**Dependency blocker:** endpoint status guest yang menampilkan detail order harus tetap dibatasi. Sampai mekanisme akses guest disetujui, implementasi tidak boleh memperluas akses publik atau mengandalkan pasangan order ID + email sebagai pengganti keputusan keamanan. Halaman dapat menampilkan status generik/terbatas atau menggunakan alur akses yang sudah terbukti aman jika memang telah tersedia dan disetujui.

## 4. Komponen repository dalam rencana

Daftar file ini berdasarkan file yang diperiksa saat audit. Sebelum implementasi, fetch ulang branch dan commit terbaru serta pastikan caller dan routing terkini.

| File / objek | Rencana perubahan |
|---|---|
| `src/pages/CheckoutPage.tsx` | Menambahkan tahap quote/review, menampilkan rincian final backend, meminta persetujuan eksplisit, lalu meminta invoice menggunakan quote ID. |
| `src/pages/PaymentPage.tsx` | Mempertahankan POP JavaScript Popup; status UI berasal dari backend. Popup event hanya memicu refresh/presentasi, bukan menulis status paid. |
| `src/pages/PaymentReturnPage.tsx` | Tidak mengandalkan query redirect atau localStorage sebagai sumber status. Memulihkan konteks secara aman; detail guest lookup tetap diblokir oleh dependency yang belum diputuskan. |
| `src/pages/OrderSuccessPage.tsx` | Memerlukan identifier order dan verifikasi server; hanya menampilkan konfirmasi sukses untuk status server `paid`. |
| Router / route definitions | Identifikasi file aktual sebelum perubahan; route sukses harus mendukung direct navigation dan refresh tanpa mengasumsikan status sukses. |
| `supabase/functions/divoom-duitku-create-invoice/index.ts` | Menambahkan/menata operasi quote, persetujuan quote, invoice creation, status read-only, dan rekonsiliasi sesudah reference tersimpan. |
| `supabase/functions/divoom-duitku-callback/index.ts` | Mempertahankan validasi callback POP; memperkuat field/result validation dan pemrosesan RPC idempotent. |
| Migration baru | Hanya objek yang terbukti dibutuhkan dari schema diff; tidak menjalankan ulang migration lama secara membabi buta. |
| Tests | Unit/integration tests untuk quote, invoice, callback, state transition, guest-access boundary, dan failure recovery. |

Tidak ada file pada tabel ini yang telah diubah oleh dokumen ini.

## 5. Arsitektur target dan urutan transaksi

### 5.1 Checkout quote

1. Frontend mengirim data customer dan daftar `productId` + quantity.
2. Backend memvalidasi format, jumlah item, quantity, dan rate limit.
3. Backend membaca ulang produk dari `divoom_products`, termasuk title, availability, price, dan sale_price.
4. Backend memastikan produk tersedia berdasarkan aturan availability yang berlaku.
5. Backend menghitung subtotal menggunakan integer IDR.
6. Backend menambahkan ongkir flat Rp52.000 tepat satu kali.
7. Backend menyimpan quote dengan snapshot item/harga/total dan expiry internal yang jelas.
8. Backend mengembalikan quote ID dan rincian final.
9. Frontend menampilkan rincian tersebut dan meminta persetujuan pembeli.

Quote harus terikat pada konteks checkout/customer secara aman. Karena guest access mechanism belum diputuskan, desain penyimpanan quote harus menghindari penggunaan quote ID sebagai bearer credential yang memberi akses luas atau memungkinkan quote ditebak.

### 5.2 Persetujuan dan invoice

1. Frontend mengirim quote ID dan nilai total yang disetujui (atau bukti persetujuan yang ditentukan kontrak).
2. Backend memuat quote dari database dan memastikan belum expired/dipakai.
3. Backend menghitung ulang atau memvalidasi ulang harga, availability, item, ongkir, dan total.
4. Jika terjadi perubahan, backend tidak membuat invoice; frontend harus menampilkan quote baru dan meminta persetujuan ulang.
5. Backend membuat merchant order ID unik dan order/payment dalam operasi database atomik sejauh mungkin.
6. Backend mengirim request Create Invoice ke environment yang dikonfigurasi.
7. Jika provider mengonfirmasi invoice sukses, backend menyimpan reference dan metadata aman.
8. Setelah reference tersimpan, backend memanggil reconciliation untuk callback yang menunggu reference.
9. Backend mengembalikan reference dan environment popup yang diperlukan frontend.

Network call ke Duitku tidak boleh ditempatkan di dalam transaksi database yang menahan lock selama request eksternal. Jika provider sukses tetapi penyimpanan database gagal, sistem harus mempertahankan merchant order ID dan kondisi recovery yang dapat ditangani, bukan mengarang reference atau membuat order pengganti.

### 5.3 Callback

1. Terima hanya metode dan content type callback POP yang didokumentasikan.
2. Parse payload tanpa mengubah nilai signature input.
3. Validasi field wajib, merchant code, amount, merchant order ID, reference, dan result code.
4. Verifikasi signature dengan API key server-side sesuai dokumentasi terkini.
5. Panggil RPC atomik untuk menyimpan event, memvalidasi mapping, dan menerapkan transisi yang diizinkan.
6. Callback sebelum reference tersimpan disimpan sebagai pending reconciliation event, bukan dibuang.
7. Setelah reference disimpan, reconciliation memproses event secara berurutan dan idempotent.
8. Return acknowledgment hanya setelah pemrosesan aman atau sesuai aturan retry yang telah diverifikasi.

### 5.4 Browser return dan success

- Redirect URL dan JavaScript Popup event hanya sinyal navigasi/UI.
- Frontend tidak dapat mengubah status order/payment menjadi paid.
- OrderSuccessPage mengambil status dari server sendiri.
- Status selain paid tidak boleh dirender sebagai keberhasilan.
- Sampai guest lookup diputuskan, jangan membuka detail order melalui endpoint publik yang hanya menerima identifier yang dapat ditebak.

## 6. Kontrak API target

Kontrak berikut adalah rancangan logical API. Nama operation/route dan bentuk final response harus diselaraskan dengan implementasi POP dan caller yang ada sebelum coding.

### 6.1 Create quote

**Request**

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

**Response**

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

Ketentuan:
- Client tidak memasok harga otoritatif.
- Quote harus punya expiry internal dan status penggunaan.
- Quote harus menyimpan snapshot yang diperlukan untuk audit.
- Email/phone/address hanya disimpan sesuai kebutuhan order dan kebijakan privasi.
- Quote tidak boleh digunakan untuk mengubah jumlah/total setelah disetujui.

### 6.2 Approve quote and create invoice

**Request konseptual**

```json
{
  "quoteId": "server-generated-quote-id",
  "acceptedTotalAmount": 252000
}
```

**Response sukses konseptual**

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

Ketentuan:
- Quote harus valid, belum kedaluwarsa, dan belum dikonsumsi.
- Nilai acceptedTotalAmount harus sama dengan nilai server.
- Jika nilai berubah, kembalikan respons conflict yang meminta quote baru.
- Jangan mengembalikan API key, service-role key, request signature, atau diagnostic internal.
- Retry harus terikat pada idempotency/merchant order yang sama dan mengikuti perilaku Create Invoice yang didokumentasikan. Jangan membuat invoice baru secara buta.

### 6.3 Read payment status

Kontrak endpoint status final belum dapat diselesaikan karena guest lookup ditunda.

Syarat minimum sebelum endpoint status order dirilis:
- Bukti akses guest yang disetujui dan diverifikasi server.
- Rate limiting dan response minimization.
- Tidak ada mutasi order/payment/inventory melalui operasi read.
- Tidak ada akses berdasarkan merchantOrderId saja.
- Tidak ada detail personal order yang dikembalikan kepada caller tanpa otorisasi.

### 6.4 Duitku HTTP callback

Kontrak wajib mengikuti dokumentasi resmi POP yang berlaku saat implementasi:
- HTTP POST.
- `application/x-www-form-urlencoded`.
- Signature callback diverifikasi server-side.
- Merchant code, amount, merchant order ID, dan reference dicocokkan dengan transaksi lokal.
- Result code divalidasi dan dipetakan secara eksplisit.
- Event disimpan dan diproses idempotent.
- Browser redirect/JS callback bukan bukti pembayaran.

Jangan mengasumsikan setiap result code selain `00` memiliki arti gagal yang sama tanpa memeriksa dokumentasi dan method pembayaran yang relevan.

## 7. Rancangan data dan migration

### 7.1 Tahap wajib: schema reconciliation

Sebelum menyusun migration executable:

1. Ambil commit dan migration files terbaru.
2. Ambil migration history dari project Supabase target yang dikonfirmasi ulang.
3. Bandingkan tabel, kolom, tipe, default, check constraints, foreign keys, indexes, triggers, RLS policies, grants, dan function definitions.
4. Bandingkan signature, body, owner, SECURITY DEFINER, search_path, dan EXECUTE grants semua RPC terkait.
5. Identifikasi asal-usul objek yang ada tetapi tidak tercatat pada migration history.
6. Susun schema diff dan migration plan yang tidak menghapus atau menimpa data.
7. Uji migration pada environment non-production sebelum meminta persetujuan production.

Project ref yang terlihat pada audit adalah `mvwflakurihhakdrlteg`; project harus dikonfirmasi kembali sebelum setiap tindakan database. Jangan menganggap project ref dari audit lama otomatis masih merupakan target yang benar.

### 7.2 Objek database yang perlu dinilai

| Objek | Rencana |
|---|---|
| `divoom_orders` | Periksa kebutuhan relasi quote, approved total, dan metadata persetujuan. Pertahankan data existing. |
| `divoom_order_items` | Pertahankan snapshot harga/title/quantity dan validasi konsistensi line total. |
| `divoom_payment_transactions` | Tentukan representasi hasil invoice ambigu setelah state-transition design disetujui. |
| `divoom_payment_callback_events` | Pastikan event menampung status menunggu reference, mismatch, duplicate, dan hasil proses dengan audit trail minimal. |
| `divoom_checkout_quotes` | Kandidat tabel quote baru; hanya dibuat jika schema aktif membuktikan belum ada objek setara. |
| `divoom_checkout_rate_limits` | Audit kembali key/action/window dan rate limit endpoint quote/status/invoice. |
| `divoom_apply_payment_callback` | Perbaiki validasi result code, reference timing, idempotency, dan terminal-state behavior. |
| `divoom_reconcile_pending_payment_callbacks` | Pastikan tersedia dan sesuai definisi yang disetujui; audit menemukan migration ada tetapi RPC tidak ditemukan di DB aktif. |
| `divoom_consume_rate_limit` | Pertahankan kecuali audit ulang menunjukkan bug atau kontrak perlu penyesuaian. |

### 7.3 RPC kandidat

RPC baru hanya dibuat bila dibutuhkan setelah audit schema:
- `divoom_create_checkout_quote`: simpan quote/snapshot secara konsisten.
- `divoom_create_order_from_quote`: validasi dan konsumsi quote serta buat order/items/payment secara atomik.
- `divoom_apply_payment_callback`: mutasi callback/order/payment atomik.
- `divoom_reconcile_pending_payment_callbacks`: proses callback tertunda setelah reference tersedia.

Seluruh RPC SECURITY DEFINER wajib:
- Menggunakan fixed search_path dan schema-qualified object names.
- Membatasi EXECUTE ke service_role jika dipanggil hanya oleh backend.
- Memvalidasi seluruh parameter dan state transition di dalam database.
- Tidak membuka direct-write privilege untuk anon/authenticated.
- Tidak menggunakan fallback direct-write jika RPC gagal.

Tidak ada nama tabel/RPC baru yang dianggap final sampai schema diff dan scope implementasi disetujui.

## 8. Status dan transition design

Status yang telah terlihat pada schema audit mencakup `pending`, `paid`, `failed`, `expired`, dan `invoice_failed`. Perubahan status harus diselaraskan dengan check constraints dan data aktual.

| Event | Payment target | Order target | Guard |
|---|---|---|---|
| Invoice provider berhasil dan reference tersimpan | pending | pending_payment | Amount dan merchant order ID cocok |
| Create Invoice ditolak secara definitif | failed/definitive failure state yang disetujui | payment_failed atau review | Hanya bila respons provider benar-benar definitif |
| Timeout / respons tidak diketahui | non-final ambiguous state yang disetujui | pending/review | Tidak boleh dianggap final failure |
| Callback sukses valid | paid | paid | Signature, amount, order, reference cocok |
| Callback gagal valid | failed sesuai result code | payment_failed | Result code dipetakan menurut POP |
| Expiry terkonfirmasi menurut aturan yang disetujui | expired | expired | Berdasarkan expiry provider/merchant yang diverifikasi |
| Callback duplikat | tidak berubah | tidak berubah | Event dedupe |
| Callback sebelum reference tersimpan | tetap pending / reconciliation pending | pending_payment | Event disimpan untuk rekonsiliasi |
| Callback terlambat setelah terminal state | sesuai kebijakan late payment | review/manual handling bila perlu | Tidak boleh memundurkan state tanpa aturan eksplisit |

**Expiry:** requirement yang disetujui adalah mengikuti konfigurasi merchant. Nilai belum ditentukan. Jangan hardcode angka dan jangan menambahkan parameter `expiryPeriod` secara eksplisit sebelum nilai, unit, dukungan method, dan konfigurasi merchant diverifikasi. Jangan membuat expiry hanya dengan timer browser.

**Inventory:** selama model kuantitatif ditunda, implementasi tidak menambah reservation/decrement. Pemeriksaan `availability` tetap berlaku. Batasan bahwa availability flag tidak mengendalikan jumlah unit harus dicatat sebagai batas bisnis yang diterima untuk scope ini.

## 9. Penanganan Create Invoice ambigu

### 9.1 Klasifikasi hasil

Implementasi harus membedakan:
- Respons provider yang mengonfirmasi invoice sukses.
- Respons provider yang secara eksplisit menolak request.
- Timeout/koneksi putus sebelum respons dapat dipastikan.
- Respons malformed atau status HTTP/provider yang tidak dapat dipastikan.
- Provider sukses tetapi persistensi reference lokal gagal.

### 9.2 Recovery

- Pertahankan merchant order ID dan payment record yang sama.
- Jangan membuat order/invoice kedua otomatis untuk transaksi yang masih ambiguous.
- Simpan diagnostic minimal (kategori error, timestamp, merchant order ID internal); jangan log secret atau payload customer penuh.
- Callback valid yang datang kemudian harus dapat menyelesaikan transaksi sesuai transition design.
- Jika tidak ada callback, jalur operator/merchant reconciliation harus ditetapkan berdasarkan kapabilitas provider yang terverifikasi.
- Jangan mengimplementasikan endpoint inquiry yang belum ditemukan dalam dokumentasi/konfigurasi resmi.

### 9.3 Idempotency dan concurrency

- Unique merchant order ID tetap menjadi kunci korelasi transaksi.
- Provider reference harus unik bila sesuai schema/provider contract.
- Callback event dedupe menggunakan event hash atau strategi dedupe yang telah diverifikasi tidak menggabungkan event sah yang berbeda.
- Lock/conditional update menjaga hanya satu transisi yang sah.
- Callback duplicate, callback race, dan reconciliation berulang tidak menggandakan efek.
- Tidak ada status terminal yang berubah mundur kecuali late-payment policy secara eksplisit mengizinkan transisi khusus.

## 10. Guest order lookup dependency

Status: **ditunda, belum dipilih**.

Konsekuensi:
- Tidak boleh memperluas GET status publik yang hanya menerima merchantOrderId dan email sebagai akses ke detail order.
- Tidak boleh menjadikan localStorage sebagai authorization.
- Tidak boleh mengembalikan data pribadi atau reference provider kepada caller yang belum terotorisasi.
- Tidak boleh menyatakan acceptance criterion guest lookup terpenuhi sebelum mekanisme akses dipilih dan diuji.

Sebelum implementasi endpoint status detail, diperlukan keputusan terpisah mengenai metode akses guest (contoh alternatif yang perlu dievaluasi: email OTP, one-time secure link, atau mekanisme aman lain), provider pengiriman, expiry token, replay prevention, rate limit, dan data yang boleh ditampilkan.

## 11. Security dan configuration

- Duitku API key dan Supabase service-role key hanya disimpan di Supabase Edge Function secrets atau secret manager yang disetujui.
- Tidak membaca, mengubah, atau menampilkan nilai secret selama tahap perencanaan.
- Sandbox credentials harus dipasangkan dengan Sandbox endpoint dan popup script environment; production hanya dengan production configuration.
- Callback tetap memerlukan signature validation meskipun `verify_jwt=false`.
- CORS bukan kontrol otorisasi.
- RLS tetap aktif dan grants minimum.
- RPC SECURITY DEFINER menggunakan fixed search_path, schema qualification, dan EXECUTE minimum.
- Rate limit untuk quote, invoice, status lookup, dan guest verification sesuai threat model.
- Response frontend tidak memuat service-role key, API key, signature rahasia, atau stack trace.
- Logging meminimalkan PII dan tidak menyimpan raw secrets/signatures.
- Nilai uang integer IDR; hindari floating-point arithmetic.
- Callback result code, amount, merchant code, merchant order ID, reference, dan environment harus divalidasi sebelum mutasi.

## 12. Test plan dan acceptance criteria

### 12.1 Quote dan persetujuan

- [ ] Harga diambil ulang dari `divoom_products`, bukan dari harga client.
- [ ] Availability diverifikasi pada backend.
- [ ] Subtotal, ongkir Rp52.000, dan total memakai integer IDR.
- [ ] Quote menyimpan snapshot dan expiry internal.
- [ ] Pembeli menyetujui total final dari backend sebelum invoice.
- [ ] Perubahan harga/availability/quantity membatalkan quote atau meminta persetujuan ulang.
- [ ] Quote tidak dapat dikonsumsi dua kali untuk membuat invoice berbeda.
- [ ] Duplicate product rows dan quantity invalid ditolak.

### 12.2 Invoice dan provider contract

- [ ] Signature request dan header diverifikasi ulang dari dokumentasi POP terkini.
- [ ] Endpoint environment dipilih dari server config yang valid.
- [ ] Provider HTTP status dibedakan dari business status.
- [ ] `itemDetails.name` tidak melebihi 50 karakter.
- [ ] Total `price × quantity` seluruh itemDetails sama dengan paymentAmount.
- [ ] Expiry mengikuti konfigurasi merchant; tidak ada angka hardcoded tanpa persetujuan.
- [ ] Timeout tidak menghasilkan failed terminal secara prematur.
- [ ] Retry tidak membuat invoice/order duplikat.
- [ ] Provider success + DB persistence failure dapat direkonsiliasi.

### 12.3 Callback dan reconciliation

- [ ] Content type dan field callback sesuai dokumentasi POP terkini.
- [ ] Missing/invalid signature gagal tertutup.
- [ ] Merchant code, amount, merchant order ID, dan reference divalidasi.
- [ ] Result code dipetakan secara eksplisit.
- [ ] Callback valid memutakhirkan payment dan order secara atomik.
- [ ] Callback duplikat tidak menggandakan efek.
- [ ] Callback sebelum reference tersimpan direkonsiliasi setelah reference tersedia.
- [ ] Reference/amount mismatch tidak mengubah status.
- [ ] Dua callback bersamaan menghasilkan satu transisi final yang sah.
- [ ] RPC failure tidak diakui sebagai callback sukses yang telah diproses.
- [ ] Late callback dan expiry race mengikuti kebijakan yang disetujui.

### 12.4 Frontend dan status

- [ ] Popup event/redirect tidak menulis status paid.
- [ ] PaymentPage hanya menampilkan status backend.
- [ ] PaymentReturnPage tidak bergantung pada query string sebagai bukti pembayaran.
- [ ] OrderSuccessPage memverifikasi server ketika dibuka langsung.
- [ ] Pending/failed/expired tidak menampilkan pesan sukses.
- [ ] LocalStorage bukan sumber kebenaran status.
- [ ] Detail guest lookup tetap dibatasi sampai dependency diselesaikan.

### 12.5 Database dan quality gates

- [ ] Migration history dan schema aktif direkonsiliasi.
- [ ] RLS, policies, grants, RPC signature/body, owner, search_path, dan EXECUTE privileges diverifikasi.
- [ ] Tidak ada data/table/function/policy yang terhapus tanpa persetujuan spesifik.
- [ ] TypeScript/build berhasil.
- [ ] Lint dan automated tests yang tersedia berhasil.
- [ ] Sandbox happy path dan negative/race tests berhasil.
- [ ] Test evidence mencatat environment, commit, waktu, expected vs actual, dan test reference yang aman.
- [ ] Tidak ada real payment atau production deployment tanpa approval terpisah.

### 12.6 Test case matrix

| ID | Skenario | Expected result |
|---|---|---|
| Q01 | Quote valid | Quote berisi harga dan total server |
| Q02 | Produk tidak tersedia | Quote ditolak |
| Q03 | Harga berubah setelah quote | Invoice ditolak; quote baru perlu disetujui |
| Q04 | Quote expired/consumed | Tidak dapat dipakai membuat invoice |
| I01 | Invoice Sandbox sukses | Reference tersimpan; popup menerima data yang diperlukan |
| I02 | Provider definitive rejection | Error dipetakan; tidak ada invoice palsu |
| I03 | Timeout/network reset | Status tetap ambiguous/non-final |
| I04 | Provider sukses, DB write gagal | Recovery dapat dilakukan tanpa order duplikat |
| I05 | Nama item > 50 karakter | Payload tetap memenuhi batas provider |
| C01 | Callback signature valid + result sukses | Payment/order menjadi paid |
| C02 | Callback signature invalid | Ditolak; status tidak berubah |
| C03 | Amount/merchant/reference mismatch | Ditolak; status tidak berubah |
| C04 | Callback duplicate | Tidak ada efek ganda |
| C05 | Callback sebelum reference tersimpan | Event menunggu dan kemudian direkonsiliasi |
| C06 | Callback bersamaan | Hanya satu transisi yang sah |
| C07 | Callback gagal | Result code dipetakan sesuai aturan |
| C08 | Callback RPC gagal | Provider dapat retry; event tidak dianggap selesai |
| S01 | OrderSuccess dibuka untuk pending | Tidak menampilkan sukses |
| S02 | Redirect query dimanipulasi | Status tetap mengikuti server |
| S03 | LocalStorage kosong | Tidak mengubah status; akses detail mengikuti guest lookup dependency |
| S04 | Guest lookup belum disetujui | Detail order tidak dibuka oleh endpoint publik |
| D01 | Migration/schema drift | Migration tidak dijalankan sebelum reconciliation |
| D02 | Sandbox/production mismatch | Gagal tertutup |
| D03 | Callback dan expiry bersamaan | Satu hasil final sesuai aturan, tanpa status mundur |
| D04 | Availability-only inventory | Tidak ada klaim stok kuantitatif/reservasi |

## 13. Tahapan implementasi yang diusulkan

| Tahap | Aktivitas | Deliverable / gate |
|---|---|---|
| 0. Reconfirm access | Verifikasi repo/branch/commit, project ref, function version, POP mode, environment; secret presence only | Baseline terkini yang tervalidasi |
| 1. Schema reconciliation | Diff migration history, schema, RPC, grants, RLS, constraints | Schema diff + migration proposal |
| 2. Contract finalization | Final quote/invoice/status/callback contract; expiry merchant configuration; guest lookup dependency explicitly unresolved | Contract revision untuk approval |
| 3. Database layer | Quote persistence, atomic order creation, callback race repair, state constraints | Migration + RPC proposal dan rollback |
| 4. Backend invoice | Quote, approval, Create Invoice classification, reference persistence, reconciliation trigger | Edge Function change |
| 5. Backend callback | Signature/result validation, idempotent RPC, safe acknowledgment/retry | Callback change |
| 6. Frontend checkout | Quote/review/approval flow | CheckoutPage change |
| 7. Frontend payment/status | Popup, return status, verified OrderSuccess | Payment UI changes |
| 8. Automated verification | Unit/integration, static checks, migration tests | Test evidence |
| 9. Sandbox verification | Valid/invalid/timeout/callback race scenarios | Sandbox evidence and unresolved issue list |
| 10. Release review | Security, operations, rollback, merchant settings, guest lookup blocker | Release-readiness report |

Setiap tahap yang menyentuh code/database hanya boleh dimulai setelah scope tahap tersebut disetujui. Jika implementasi menemukan perubahan scope baru, hentikan dan minta persetujuan tambahan.

## 14. Rollback dan recovery plan

### Frontend
- Perubahan UI dapat dikembalikan ke commit sebelumnya jika kontrak backend belum dirilis.
- Jangan menghapus jalur lama sebelum caller dan kompatibilitas diverifikasi.
- Feature rollout harus menjaga agar checkout tidak mengirim request ke kontrak yang belum tersedia.

### Edge Functions
- Simpan commit/version sebelumnya dan catat function version sebelum deployment.
- Deploy hanya setelah persetujuan deployment terpisah.
- Jika function baru gagal, rollback ke versi yang kompatibel dengan schema yang sedang aktif.
- Jangan rollback function ke versi yang tidak dapat membaca status/migration baru tanpa compatibility check.

### Database
- Migration additive terlebih dahulu jika memungkinkan.
- Hindari destructive rename/drop atau perubahan yang menghilangkan data.
- Setiap migration perlu precondition, postcondition, backup/recovery plan, dan validasi data.
- Jangan menghapus status/event lama saat recovery.
- Jika schema baru tidak kompatibel, hentikan rollout dan gunakan prosedur recovery yang telah diuji; jangan menjalankan SQL improvisasi di production.

### Provider/payment
- Tidak ada real payment selama testing.
- Jangan membuat invoice duplikat untuk transaksi ambiguous.
- Rekonsiliasi provider dan database sebelum tindakan manual.
- Refund/late payment ditangani berdasarkan kebijakan merchant yang diverifikasi; status lokal bukan bukti refund provider.

## 15. Risiko dan dependency terbuka

| Risiko / dependency | Dampak | Tindakan sebelum release |
|---|---|---|
| Guest order lookup belum diputuskan | Status/detail order tidak boleh dibuka melalui endpoint publik yang lemah | Putuskan mekanisme akses dan uji security |
| Expiry merchant belum diketahui | Tidak dapat menetapkan nilai expiry request atau lifecycle final | Verifikasi dashboard/kontrak merchant; jangan hardcode |
| Migration drift | Risiko menjalankan migration salah atau tidak idempotent | Schema reconciliation lengkap |
| Invoice ambiguous state belum ada di schema | Callback sukses dapat tertahan oleh state yang dianggap terminal | Finalisasi state transition dan migration |
| Provider inquiry capability belum diverifikasi | Tidak ada dasar untuk mengimplementasikan polling provider | Gunakan callback dan jalur merchant yang terdokumentasi; jangan mengarang endpoint |
| Inventory kuantitatif ditunda | Availability tidak menjamin unit stock | Dokumentasikan model availability-only dan konfirmasi bisnis |
| Test suite belum dijalankan pada baseline audit | Kualitas runtime belum terbukti | Jalankan build/test sebelum dan sesudah perubahan |
| Merchant settings belum diverifikasi | Callback/return URL atau environment dapat salah | Verifikasi tanpa mengekspos credential |

## 16. Referensi resmi dan verifikasi sebelum implementasi

Sumber kontrak provider: https://docs.duitku.com/pop/id/

Bagian yang harus dibaca ulang tepat sebelum coding:
- POP Create Invoice dan parameter yang didukung.
- Request headers, timestamp, signature formula, encoding.
- `itemDetails` field constraints dan total amount validation.
- Callback content type, fields, signature, result codes, acknowledgment/retry behavior.
- JavaScript Popup callback events dan return redirect semantics.
- Expiry behavior dan `expiryPeriod` support/default/unit untuk merchant/method yang digunakan.
- Sandbox dan production endpoint/script environment.

Jangan mengasumsikan parameter expiry atau provider inquiry hanya dari contoh lama. Catat tanggal pemeriksaan dokumentasi dan konfigurasi merchant yang benar-benar tersedia. Secret values tidak boleh dibaca atau ditampilkan.

## 17. Approval gates

### Telah disetujui sebagai requirement baseline

- [x] Backend quote dan final total approval.
- [x] Callback race dan idempotent reconciliation.
- [x] Penanganan invoice ambiguity.
- [x] Server verification pada OrderSuccessPage.
- [x] Batas item name 50 karakter.
- [x] Expiry mengikuti konfigurasi merchant; nilai belum ditentukan.
- [x] Guest order lookup ditunda sebagai dependency.
- [x] Inventory kuantitatif ditunda.
- [x] Schema/migration reconciliation wajib dilakukan.
- [x] Ongkir Rp52.000.

### Belum disetujui sebagai izin implementasi

- [ ] Perubahan source code frontend.
- [ ] Perubahan Edge Functions.
- [ ] Pembuatan/perubahan migration, tabel, constraints, atau RPC.
- [ ] Perubahan RLS, grants, atau privileges.
- [ ] Perubahan secrets atau konfigurasi merchant.
- [ ] Menjalankan migration pada Supabase.
- [ ] Deployment Edge Functions/frontend.
- [ ] Real payment atau perubahan production data.

**Persetujuan implementation plan bukan otomatis persetujuan seluruh tindakan di atas.** Sebelum coding, ajukan scope implementasi terpisah yang menyebutkan file, objek database, environment, test, dan rollback secara spesifik.

## 18. Kesimpulan

Rencana ini mengutamakan rekonsiliasi schema terlebih dahulu, lalu kontrak quote/invoice, callback dan recovery, frontend status verification, serta Sandbox verification. Expiry mengikuti konfigurasi merchant tanpa nilai yang di-hardcode. Guest order lookup tetap menjadi dependency yang belum diputuskan dan membatasi rilis endpoint status/detail order. Inventory kuantitatif tetap di luar scope.

**Status saat ini: dokumen perencanaan saja. Tidak ada implementasi, migration, secret change, database mutation, atau deployment.**
