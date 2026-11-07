import { LegalDocumentConfig } from '../types/legal';

export const termsAndConditionsConfig: LegalDocumentConfig = {
  slug: '/terms-and-conditions',
  title: 'Syarat dan Ketentuan',
  subtitle: 'Ketentuan resmi penggunaan website, katalog produk, dan transaksi belanja di Divoom Store Indonesia.',
  badge: 'Perjanjian Pengguna',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '2.1.0',
  sections: [
    {
      id: 'ketentuan-umum',
      heading: '1. Ketentuan Umum & Definisi',
      paragraphs: [
        'Selamat datang di Divoom Store. Dengan mengakses, menjelajahi, atau melakukan pembelian pada website ini, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan yang berlaku.',
        '"Divoom Store" mengacu pada platform storefront digital resmi yang menyediakan produk perangkat audio, pixel display, dan aksesoris pintar Divoom. "Pengguna" atau "Pelanggan" adalah setiap individu yang mengakses atau melakukan pemesanan melalui platform ini baik sebagai tamu (guest) maupun pengguna terdaftar.'
      ],
      bullets: [
        'Layanan ini ditujukan untuk pengguna berusia minimal 18 tahun atau yang berada di bawah pengawasan orang tua/wali.',
        'Transaksi jual beli dianggap sah dan mengikat setelah invoice pembayaran berhasil diterbitkan dan status pembayaran terverifikasi oleh server.'
      ]
    },
    {
      id: 'akun-dan-tamu',
      heading: '2. Sesi Pengguna & Belanja Mode Tamu',
      paragraphs: [
        'Divoom Store mendukung sistem transaksi Guest Checkout di mana data keranjang belanja dan preferensi disimpan secara lokal di peramban (browser local storage). Pelanggan bertanggung jawab untuk memastikan keakuratan informasi kontak dan alamat pengiriman saat checkout.'
      ],
      bullets: [
        'Pelanggan wajib memberikan nama lengkap, nomor telepon aktif, dan alamat email yang valid untuk pengiriman konfirmasi transaksi dan invoice.',
        'Divoom Store tidak bertanggung jawab atas kegagalan pengiriman akibat kesalahan input alamat atau data kontak oleh pelanggan.'
      ]
    },
    {
      id: 'produk-dan-harga',
      heading: '3. Informasi Produk & Harga',
      paragraphs: [
        'Kami berusaha menyajikan visualisasi warna, dimensi, dan spesifikasi teknis produk Divoom (seperti seri Ditoo-Pro, Pixoo-64, Backpack-S2, Planet-9) seakurat mungkin. Namun, variasi tampilan layar perangkat Anda dapat mempengaruhi persepsi warna fisik produk.',
        'Semua harga produk tertera dalam mata uang Rupiah (IDR) dan dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Harga yang berlaku adalah harga final yang tercantum saat proses pembuatan invoice checkout.'
      ]
    },
    {
      id: 'pembayaran-transaksi',
      heading: '4. Transaksi & Pembayaran',
      paragraphs: [
        'Seluruh transaksi pembayaran digital diproses secara aman melalui payment gateway resmi Duitku POP. Pesanan baru akan diproses ke tahap pengemasan setelah callback server memvalidasi status pembayaran sebagai lunas (Paid).'
      ],
      callout: {
        type: 'info',
        text: 'Pemberitahuan: Popup pembayaran Duitku memiliki batas waktu penyelesaian transaksi. Jika waktu pembayaran habis, invoice akan kedaluwarsa secara otomatis.'
      }
    },
    {
      id: 'hak-kekayaan-intelektual',
      heading: '5. Hak Kekayaan Intelektual',
      paragraphs: [
        'Semua konten yang terdapat pada situs ini, termasuk namun tidak terbatas pada teks, grafik, logo Divoom, visual produk, audio demo, dan kode perangkat lunak, dilindungi oleh undang-undang hak cipta dan merek dagang internasional.',
        'Dilarang keras menyalin, mendistribusikan, atau memodifikasi materi situs ini tanpa persetujuan tertulis sebelumnya dari Divoom.'
      ]
    },
    {
      id: 'hukum-yang-berlaku',
      heading: '6. Hukum yang Berlaku',
      paragraphs: [
        'Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia. Segala perselisihan yang timbul dari pelaksanaan syarat ini akan diselesaikan secara musyawarah untuk mufakat.'
      ]
    }
  ],
  relatedLinks: [
    { title: 'Kebijakan Privasi', route: '/privacy-policy' },
    { title: 'Kebijakan Pembayaran', route: '/payment-policy' },
    { title: 'Kebijakan Pengiriman', route: '/shipping-policy' }
  ]
};

export const privacyPolicyConfig: LegalDocumentConfig = {
  slug: '/privacy-policy',
  title: 'Kebijakan Privasi',
  subtitle: 'Bagaimana Divoom Store mengumpulkan, mengelola, melindungi, dan menghormati data pribadi Anda.',
  badge: 'Perlindungan Data',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '2.0.0',
  sections: [
    {
      id: 'informasi-yang-dikumpulkan',
      heading: '1. Informasi Pribadi yang Dikumpulkan',
      paragraphs: [
        'Kami menghormati privasi Anda dan berkomitmen menjaga kerahasiaan informasi personal pelanggan. Ketika Anda melakukan pemesanan melalui Divoom Store, kami hanya mengumpulkan informasi yang esensial untuk memproses pesanan dan pengiriman.'
      ],
      bullets: [
        'Data Identitas: Nama lengkap penerima pesanan.',
        'Data Kontak: Alamat email aktif dan nomor telepon/WhatsApp.',
        'Data Pengiriman: Alamat lengkap tujuan pengiriman, kota/kabupaten, dan kode pos.',
        'Data Sesi Browser: Riwayat keranjang (Cart) dan daftar produk favorit (Wishlist) yang disimpan di penyimpanan lokal peramban Anda (Local Storage).'
      ]
    },
    {
      id: 'penggunaan-informasi',
      heading: '2. Tujuan Penggunaan Data',
      paragraphs: [
        'Data pribadi yang dikumpulkan digunakan semata-mata untuk tujuan operasional transaksi dan layanan pelanggan:'
      ],
      bullets: [
        'Membuat invoice transaksi dan memproses otorisasi pembayaran melalui payment gateway Duitku POP.',
        'Mengirimkan konfirmasi status pesanan dan tanda terima digital ke email Anda.',
        'Menyediakan data pengiriman untuk kurir dan ekspedisi logistik mitra.',
        'Memberikan layanan bantuan teknis atau klaim garansi jika diperlukan.'
      ]
    },
    {
      id: 'keamanan-data',
      heading: '3. Keamanan Data & Kerahasiaan Finansial',
      paragraphs: [
        'Divoom Store tidak pernah menyimpan nomor kartu kredit, nomor CVV, PIN, atau kredensial perbankan pelanggan di server kami. Semua data pembayaran ditransmisikan secara langsung dan terenkripsi melalui protokol SSL/TLS ke payment gateway Duitku yang bersertifikasi PCI-DSS.',
        'Akses internal ke data pesanan dibatasi secara ketat dengan protokol autentikasi berbasis peran (Role-Based Access Control).'
      ],
      callout: {
        type: 'success',
        text: 'Keamanan Transaksi: Kami menerapkan enkripsi SHA-256 dan HMAC untuk verifikasi integritas callback pembayaran dan perlindungan data pelanggan.'
      }
    },
    {
      id: 'berbagi-dengan-pihak-ketiga',
      heading: '4. Pengungkapan kepada Pihak Ketiga',
      paragraphs: [
        'Kami tidak akan pernah menjual, menyewakan, atau menukar data pribadi Anda kepada pihak ketiga untuk kepentingan pemasaran tanpa persetujuan Anda. Informasi Anda hanya dibagikan kepada penyedia layanan tepercaya berikut:'
      ],
      bullets: [
        'Penyedia Payment Gateway (Duitku) untuk penerbitan virtual account, QRIS, atau invoice kartu.',
        'Mitra logistik dan ekspedisi resmi untuk pengantaran paket fisik pesanan ke alamat Anda.'
      ]
    },
    {
      id: 'hak-pengguna',
      heading: '5. Hak Pelanggan atas Data',
      paragraphs: [
        'Anda berhak meminta pembaruan, perbaikan, atau penghapusan data kontak pesanan dari riwayat transaksi kami dengan menghubungi tim dukungan resmi di support@divoom.com.'
      ]
    }
  ],
  relatedLinks: [
    { title: 'Syarat dan Ketentuan', route: '/terms-and-conditions' },
    { title: 'Kebijakan Pembayaran', route: '/payment-policy' },
    { title: 'Hubungi Kami', route: '/contact-us' }
  ]
};

export const shippingPolicyConfig: LegalDocumentConfig = {
  slug: '/shipping-policy',
  title: 'Kebijakan Pengiriman',
  subtitle: 'Ketentuan tarif flat pengiriman, durasi ekspedisi, proses pengemasan, dan pelacakan pesanan.',
  badge: 'Logistik & Ekspedisi',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '1.4.0',
  sections: [
    {
      id: 'biaya-pengiriman',
      heading: '1. Ketentuan Tarif Ongkos Kirim',
      paragraphs: [
        'Untuk mempermudah pengalaman berbelanja pelanggan di seluruh Indonesia, Divoom Store menerapkan tarif pengiriman flat (Flat Rate Shipping) yang terstandardisasi.',
        'Biaya pengiriman flat ditetapkan sebesar Rp 52.000 per transaksi pesanan, terlepas dari jumlah item produk Divoom yang dipesan dalam satu keranjang belanja.'
      ],
      callout: {
        type: 'info',
        text: 'Tarif Pengiriman Flat: Rp 52.000 sudah mencakup biaya pengemasan dengan perlindungan ekstra (bubble wrap berlapis tebal dan segel pelindung benturan untuk perangkat elektronik pixel art).'
      }
    },
    {
      id: 'waktu-pemrosesan',
      heading: '2. Waktu Pemrosesan Pesanan',
      paragraphs: [
        'Pesanan yang pembayaran resminya telah terverifikasi oleh server akan diproses sesuai jadwal operasional pergudangan:'
      ],
      bullets: [
        'Pesanan yang terkonfirmasi lunas sebelum pukul 14:00 WIB (Senin – Jumat) akan dikemas dan diserahkan ke pihak ekspedisi pada hari yang sama.',
        'Pesanan yang masuk setelah pukul 14:00 WIB atau pada hari Sabtu, Minggu, dan Libur Nasional akan diproses pada hari kerja berikutnya.',
        'Setiap unit perangkat elektronik Divoom melalui proses Quality Control (QC) fisik sebelum disegel ke dalam kemasan ekspedisi.'
      ]
    },
    {
      id: 'durasi-pengiriman',
      heading: '3. Estimasi Durasi Pengiriman',
      paragraphs: [
        'Estimasi waktu pengiriman paket bergantung pada zona wilayah tujuan pelanggan:'
      ],
      bullets: [
        'Jabodetabek & Kota Besar Pulau Jawa: 1 – 3 hari kerja.',
        'Luar Pulau Jawa (Ibu Kota Provinsi & Kota Besar): 2 – 5 hari kerja.',
        'Daerah Pelosok / Wilayah Kepulauan: 4 – 8 hari kerja tergantung aksesibilitas ekspedisi lokal.'
      ]
    },
    {
      id: 'pelacakan-pesanan',
      heading: '4. Pelacakan Nomor Resi (Waybill)',
      paragraphs: [
        'Setelah paket diserahkan ke jasa kurir, nomor resi pengiriman akan diperbarui pada sistem. Pelanggan dapat memantau status pesanan kapan saja melalui menu Order Lookup dan Shipment Tracking di halaman aplikasi.'
      ]
    },
    {
      id: 'penerimaan-dan-unboxing',
      heading: '5. Prosedur Penerimaan Paket & Unboxing',
      paragraphs: [
        'Pelanggan diwajibkan untuk merekam video unboxing tanpa jeda (uninterrupted video) mulai dari memperlihatkan resi pengiriman yang utuh, membuka segel kardus, hingga produk dinyalakan pertama kali.',
        'Video unboxing adalah syarat mutlak yang diperlukan untuk klaim asuransi pengiriman jika terjadi kerusakan fisik atau kehilangan isi paket selama transit ekspedisi.'
      ]
    }
  ],
  relatedLinks: [
    { title: 'Kebijakan Pengembalian', route: '/return-refund-policy' },
    { title: 'Lacak Pengiriman', route: '/tracking' },
    { title: 'Kebijakan Garansi', route: '/warranty-policy' }
  ]
};

export const paymentPolicyConfig: LegalDocumentConfig = {
  slug: '/payment-policy',
  title: 'Kebijakan Pembayaran',
  subtitle: 'Panduan metode pembayaran, integrasi Duitku POP, keamanan transaksi, dan verifikasi server.',
  badge: 'Transaksi Digital',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '2.0.0',
  sections: [
    {
      id: 'gateway-resmi',
      heading: '1. Integrasi Payment Gateway Duitku POP',
      paragraphs: [
        'Divoom Store mengintegrasikan sistem pembayaran resmi Duitku POP (Payment Online Pop-up) yang berizin dan diawasi oleh Bank Indonesia.',
        'Proses pembayaran dilakukan secara langsung di jendela interaktif (popup checkout) tanpa mengalihkan Anda ke situs eksternal yang tidak dikenal, menjamin keamanan transaksi yang lancar dan andal.'
      ]
    },
    {
      id: 'metode-pembayaran',
      heading: '2. Metode Pembayaran yang Didukung',
      paragraphs: [
        'Melalui Duitku POP, pelanggan dapat memilih berbagai opsi saluran pembayaran resmi di Indonesia:'
      ],
      bullets: [
        'Virtual Account (VA): BCA, Mandiri, BNI, BRI, Permata, CIMB Niaga, dan bank rekanan lainnya.',
        'QRIS Real-Time: Dapat dibayar menggunakan GoPay, OVO, DANA, ShopeePay, LinkAja, BCA Mobile, atau aplikasi mobile banking berlogo QRIS.',
        'E-Wallet: Pembayaran langsung melalui dompet digital mitra Duitku.',
        'Kartu Kredit / Debit Online: Visa, Mastercard, dan JCB dengan protokol 3D Secure OTP.'
      ]
    },
    {
      id: 'alur-verifikasi',
      heading: '3. Mekanisme Verifikasi Pembayaran Server-Authoritative',
      paragraphs: [
        'Keamanan transaksi pelanggan dilindungi dengan arsitektur Server-Authoritative. Pengalihan browser (redirect URL) bukan merupakan bukti sah pembayaran.',
        'Pesanan hanya dinyatakan sah dan berstatus "Paid" setelah server Divoom Store menerima notifikasi callback HTTP POST terotentikasi dari server Duitku dengan signature kriptografi HMAC-SHA256 yang valid.'
      ],
      callout: {
        type: 'warning',
        text: 'Catatan Keamanan: Jangan menutup halaman pembayaran atau menghapus sesi peramban sebelum transaksi Anda menampilkan notifikasi status pembayaran terverifikasi.'
      }
    },
    {
      id: 'kedaluwarsa-invoice',
      heading: '4. Batas Waktu Pembayaran (Expiry Time)',
      paragraphs: [
        'Setiap invoice Duitku POP memiliki batas waktu penyelesaian pembayaran (umumnya 24 jam untuk Virtual Account, dan 15-30 menit untuk QRIS dinamis). Jika pembayaran tidak diselesaikan dalam batas waktu tersebut, invoice akan dibatalkan secara otomatis oleh sistem.'
      ]
    },
    {
      id: 'mata-uang-dan-pajak',
      heading: '5. Mata Uang Transaksi',
      paragraphs: [
        'Semua transaksi ditagih dalam mata uang Rupiah (IDR). Total pembayaran akhir yang tertera pada invoice telah mencakup harga produk dan biaya pengiriman flat Rp 52.000 tanpa biaya tersembunyi.'
      ]
    }
  ],
  relatedLinks: [
    { title: 'Syarat dan Ketentuan', route: '/terms-and-conditions' },
    { title: 'Kebijakan Pengembalian Dana', route: '/return-refund-policy' },
    { title: 'FAQ Pembayaran', route: '/faq' }
  ]
};

export const returnRefundPolicyConfig: LegalDocumentConfig = {
  slug: '/return-refund-policy',
  title: 'Kebijakan Pengembalian & Refund',
  subtitle: 'Ketentuan dan prosedur pengembalian barang, penukaran unit cacat produksi, dan pengembalian dana.',
  badge: 'Jaminan Pelanggan',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '1.5.0',
  sections: [
    {
      id: 'syarat-pengembalian',
      heading: '1. Syarat Pengembalian Barang',
      paragraphs: [
        'Kepuasan pelanggan adalah prioritas kami. Divoom Store menerima pengajuan pengembalian barang atau penukaran unit dalam kondisi berikut:'
      ],
      bullets: [
        'Produk mengalami cacat fungsi pabrik (manufacturing defect) saat pertama kali dinyalakan.',
        'Produk yang diterima tidak sesuai dengan varian warna, tipe seri, atau pesanan yang tertera pada invoice.',
        'Produk mengalami kerusakan fisik parah saat pengiriman yang dibuktikan dengan rekaman video unboxing lengkap tanpa jeda.',
        'Pengajuan retur dilakukan maksimal dalam waktu 7 (tujuh) hari kalender terhitung sejak paket diterima menurut catatan ekspedisi.'
      ]
    },
    {
      id: 'kondisi-barang',
      heading: '2. Kelengkapan Produk yang Diretur',
      paragraphs: [
        'Unit produk yang diretur harus memenuhi kriteria kelengkapan berikut:'
      ],
      bullets: [
        'Produk berada dalam kemasan aslinya beserta kotak kemasan, buku manual, kabel pengisi daya, dan stiker/aksesoris bawaan pabrik.',
        'Nomor seri (Serial Number) pada unit harus cocok dengan catatan pengiriman pesanan.',
        'Produk tidak mengalami kerusakan akibat kelalaian pengguna (jatuh, terkena air/cairan, korsleting daya tegangan tinggi, atau pembongkaran casing mandiri).'
      ]
    },
    {
      id: 'proses-refund',
      heading: '3. Prosedur & Durasi Pengembalian Dana (Refund)',
      paragraphs: [
        'Jika opsi penukaran unit pengganti tidak memungkinkan karena stok habis, pelanggan berhak menerima pengembalian dana penuh (100% dari total pesanan termasuk ongkos kirim):'
      ],
      bullets: [
        'Setelah produk retur tiba di Service Center kami dan lolos inspeksi teknisi (maksimal 2 hari kerja).',
        'Pengembalian dana diproses ke rekening bank pelanggan atau saldo dompet digital asal transaksi dalam waktu 3 – 5 hari kerja kerja bank.',
        'Biaya pengiriman barang retur dari pelanggan ke Service Center akan diganti oleh Divoom Store apabila terbukti merupakan cacat produksi atau kesalahan kirim.'
      ]
    },
    {
      id: 'cara-pengajuan',
      heading: '4. Cara Mengajukan Retur',
      paragraphs: [
        'Untuk memulai klaim pengembalian, silakan kirimkan email ke support@divoom.com dengan melampirkan Merchant Order ID, rekaman video unboxing, serta deskripsi kendala yang dialami. Tim Customer Care kami akan merespons dalam 1x24 jam.'
      ]
    }
  ],
  relatedLinks: [
    { title: 'Kebijakan Garansi', route: '/warranty-policy' },
    { title: 'Kebijakan Pembatalan', route: '/cancellation-policy' },
    { title: 'Hubungi Customer Care', route: '/contact-us' }
  ]
};

export const cancellationPolicyConfig: LegalDocumentConfig = {
  slug: '/cancellation-policy',
  title: 'Kebijakan Pembatalan Pesanan',
  subtitle: 'Aturan dan mekanisme pembatalan pesanan sebelum dan sesudah verifikasi pembayaran.',
  badge: 'Ketentuan Order',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '1.2.0',
  sections: [
    {
      id: 'pembatalan-sebelum-bayar',
      heading: '1. Pembatalan Sebelum Pembayaran Terverifikasi',
      paragraphs: [
        'Pesanan yang invoice-nya telah dibuat namun belum dibayarkan (status masih pending di Duitku POP) dapat dibatalkan sewaktu-waktu oleh pelanggan secara otomatis dengan tidak melanjutkan proses pembayaran.',
        'Invoice yang tidak dibayar dalam batas waktu expiry time akan kedaluwarsa secara otomatis dan pesanan tidak akan diproses.'
      ]
    },
    {
      id: 'pembatalan-setelah-bayar',
      heading: '2. Pembatalan Setelah Pembayaran Lunas',
      paragraphs: [
        'Apabila pembayaran telah terkonfirmasi lunas namun pesanan belum diserahkan ke jasa ekspedisi (status belum dipacking/dikirim):'
      ],
      bullets: [
        'Pelanggan dapat mengajukan pembatalan darurat dengan segera menghubungi Customer Care di support@divoom.com dalam kurun waktu maksimal 2 jam setelah pembayaran.',
        'Jika pesanan belum diproses cetak label pengiriman, pembatalan dapat disetujui dan pengembalian dana diproses sesuai Kebijakan Refund.'
      ]
    },
    {
      id: 'pesanan-dalam-pengiriman',
      heading: '3. Pesanan yang Telah Diserahkan ke Ekspedisi',
      paragraphs: [
        'Pesanan yang telah diserahkan kepada pihak ekspedisi dan telah memiliki nomor resi aktif tidak dapat dibatalkan di tengah jalan.',
        'Jika Anda ingin mengembalikan produk setelah diterima, proses harus mengikuti ketentuan pada Kebijakan Pengembalian & Refund.'
      ],
      callout: {
        type: 'warning',
        text: 'Penolakan Paket di Tempat (COD): Divoom Store menerapkan sistem pembayaran digital penuh (non-COD). Menolak paket yang sah dari kurir tanpa alasan cacat fisik dapat mengakibatkan pembatasan akun pelanggan di masa mendatang.'
      }
    },
    {
      id: 'pembatalan-oleh-sistem',
      heading: '4. Pembatalan Sepihak oleh Pihak Divoom Store',
      paragraphs: [
        'Divoom Store berhak membatalkan pesanan secara sepihak dalam kondisi force majeure, ketidaksesuaian data verifikasi fraud detection, atau ketidaktersediaan stok mendadak. Dalam kondisi ini, dana pelanggan akan dikembalikan secara penuh 100% tanpa potongan.'
      ]
    }
  ],
  relatedLinks: [
    { title: 'Kebijakan Pengembalian', route: '/return-refund-policy' },
    { title: 'Kebijakan Pembayaran', route: '/payment-policy' },
    { title: 'Hubungi Bantuan', route: '/contact-us' }
  ]
};

export const warrantyPolicyConfig: LegalDocumentConfig = {
  slug: '/warranty-policy',
  title: 'Kebijakan Garansi Produk',
  subtitle: 'Jaminan garansi resmi 12 bulan untuk perangkat hardware Divoom bergaransi Indonesia.',
  badge: 'Garansi Resmi',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '2.0.0',
  sections: [
    {
      id: 'cakupan-garansi',
      heading: '1. Masa Berlaku & Cakupan Garansi',
      paragraphs: [
        'Seluruh unit hardware original Divoom (Ditoo-Pro, Pixoo-64, Planet-9, Pixel Backpack-S2) yang dibeli melalui Divoom Store dilindungi oleh Garansi Resmi Terbatas selama 12 (dua belas) bulan sejak tanggal invoice transaksi.'
      ],
      bullets: [
        'Garansi mencakup kerusakan modul audio speaker, driver DSP, panel layar LED Pixel, modul Bluetooth/WiFi, dan baterai lithium bawaan akibat cacat perakitan pabrik.',
        'Perbaikan atau penggantian unit selama masa garansi tidak dipungut biaya suku cadang maupun jasa servis resmi.'
      ]
    },
    {
      id: 'pengecualian-garansi',
      heading: '2. Pengecualian Garansi (Void Warranty)',
      paragraphs: [
        'Garansi resmi tidak berlaku (batal) apabila kerusakan disebabkan oleh faktor-faktor berikut:'
      ],
      bullets: [
        'Kerusakan fisik akibat jatuh, benturan keras, retak, atau goresan parah setelah produk diterima dalam kondisi baik.',
        'Kerusakan yang diakibatkan oleh masuknya cairan (water damage), korosi kimia, atau paparan suhu ekstrem yang melebihi standar operasional.',
        'Kerusakan akibat penggunaan adaptor pengisi daya non-standar atau lonjakan tegangan listrik (overvoltage).',
        'Unit telah dibongkar, dimodifikasi, atau diservis oleh pihak ketiga yang bukan teknisi resmi Divoom.',
        'Segel garansi atau label nomor seri (Serial Number) pada unit rusak, robek, atau tidak terbaca.'
      ]
    },
    {
      id: 'prosedur-klaim',
      heading: '3. Prosedur Klaim Garansi',
      paragraphs: [
        'Langkah-langkah untuk melakukan klaim garansi hardware Divoom:'
      ],
      bullets: [
        '1. Siapkan bukti invoice digital Divoom Store dan foto/video yang menunjukkan kendala perangkat.',
        '2. Hubungi tim teknis via email support@divoom.com untuk mendapatkan instruksi troubleshooting mandiri.',
        '3. Jika kendala menetap, Anda akan menerima nomor RMA (Return Merchandise Authorization) dan alamat Service Center resmi.',
        '4. Kirimkan unit perangkat beserta kotak dan kartu garansi ke Service Center.',
        '5. Tim teknisi akan memeriksa dan menyelesaikan servis/penggantian unit dalam waktu 3 – 7 hari kerja.'
      ]
    }
  ],
  relatedLinks: [
    { title: 'Ketentuan Retur & Refund', route: '/return-refund-policy' },
    { title: 'FAQ Teknis Produk', route: '/faq' },
    { title: 'Kontak Tim Servis', route: '/contact-us' }
  ]
};

export const faqConfig: LegalDocumentConfig = {
  slug: '/faq',
  title: 'Pertanyaan Umum (FAQ)',
  subtitle: 'Jawaban lengkap seputar produk Divoom, proses pemesanan, pembayaran Duitku, garansi, dan pengiriman.',
  badge: 'Pusat Bantuan',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '2.2.0',
  sections: [
    {
      id: 'panduan-faq',
      heading: 'Pusat Jawaban Cepat Divoom Store',
      paragraphs: [
        'Temukan jawaban atas pertanyaan yang paling sering diajukan oleh pelanggan kami di bawah ini. Jika pertanyaan Anda belum terjawab, jangan ragu untuk menghubungi tim dukungan kami.'
      ]
    }
  ],
  faqs: [
    {
      category: 'Umum',
      question: 'Apakah produk Divoom yang dijual di sini 100% original dan bergaransi?',
      answer: 'Ya, seluruh produk yang dipajang di Divoom Store merupakan produk original Divoom bergaransi resmi 12 bulan dengan dukungan purnajual dan layanan pelanggan resmi di Indonesia.'
    },
    {
      category: 'Umum',
      question: 'Apakah saya perlu mendaftar akun untuk membeli produk Divoom?',
      answer: 'Tidak perlu. Divoom Store mengutamakan kenyamanan pelanggan melalui sistem Guest Checkout. Anda cukup memasukkan nama penerima, alamat pengiriman, dan email untuk konfirmasi invoice.'
    },
    {
      category: 'Pesanan & Pengiriman',
      question: 'Berapa biaya pengiriman pesanan saya?',
      answer: 'Divoom Store menerapkan tarif pengiriman flat sebesar Rp 52.000 ke seluruh wilayah jangkauan pengiriman di Indonesia, sudah termasuk proteksi kemasan bubble wrap berlapis tebal untuk keamanan perangkat elektronik Anda.'
    },
    {
      category: 'Pesanan & Pengiriman',
      question: 'Bagaimana cara melacak pesanan saya yang sudah dikirim?',
      answer: 'Anda dapat menggunakan fitur "Order Lookup" di menu profil/bantuan untuk melihat status pesanan terbaru, atau memasukkan nomor resi pada menu "Shipment Tracking" yang terintegrasi di aplikasi.'
    },
    {
      category: 'Pembayaran',
      question: 'Metode pembayaran apa saja yang tersedia?',
      answer: 'Kami bermitra resmi dengan Duitku POP untuk menyediakan pembayaran melalui Virtual Account (BCA, Mandiri, BNI, BRI, Permata, dll.), QRIS instan dari semua aplikasi e-wallet & mobile banking, serta Kartu Kredit/Debit berlogo Visa dan Mastercard.'
    },
    {
      category: 'Pembayaran',
      question: 'Bagaimana jika jendela popup pembayaran Duitku tertutup secara tidak sengaja?',
      answer: 'Jangan khawatir. Anda dapat membuka kembali jendela pembayaran dengan menekan tombol "Open Payment Window" di halaman pembayaran selama batas waktu invoice masih aktif.'
    },
    {
      category: 'Produk & Garansi',
      question: 'Bagaimana cara menghubungkan speaker atau pixel frame Divoom dengan aplikasi HP?',
      answer: 'Unduh aplikasi resmi "Divoom" yang tersedia gratis di Google Play Store dan Apple App Store. Aktifkan Bluetooth atau koneksi Wi-Fi (khusus seri Pixoo-64), lalu ikuti instruksi pairing di aplikasi untuk memilih ribuan animasi pixel art dari komunitas global.'
    },
    {
      category: 'Produk & Garansi',
      question: 'Berapa lama masa garansi produk Divoom dan bagaimana cara klaimnya?',
      answer: 'Masa garansi resmi hardware adalah 12 bulan sejak tanggal pembelian. Untuk klaim garansi, cukup kirimkan nomor invoice dan rekaman kendala ke support@divoom.com untuk mendapatkan nomor tiket RMA.'
    },
    {
      category: 'Pengembalian',
      question: 'Apakah saya bisa mengajukan retur jika unit yang saya terima rusak?',
      answer: 'Tentu saja. Kami memberikan garansi penukaran unit baru dalam 7 hari setelah penerimaan barang jika terdapat cacat pabrik atau kerusakan dalam perjalanan ekspedisi, dengan menyertakan video unboxing resmi.'
    }
  ],
  relatedLinks: [
    { title: 'Kebijakan Garansi', route: '/warranty-policy' },
    { title: 'Kebijakan Pengiriman', route: '/shipping-policy' },
    { title: 'Hubungi Customer Care', route: '/contact-us' }
  ]
};

export const contactUsConfig: LegalDocumentConfig = {
  slug: '/contact-us',
  title: 'Hubungi Kami',
  subtitle: 'Tim dukungan pelanggan Divoom Store siap membantu Anda seputar konsultasi produk, kendala pembayaran, dan status pesanan.',
  badge: 'Customer Support',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '2.0.0',
  sections: [
    {
      id: 'saluran-resmi',
      heading: 'Layanan Bantuan Resmi Divoom Store',
      paragraphs: [
        'Kami berdedikasi memberikan pengalaman terbaik bagi seluruh pengguna dan penggemar pixel art Divoom. Silakan hubungi saluran resmi kami di bawah ini untuk mendapatkan bantuan yang cepat dan tepat sasaran.'
      ]
    },
    {
      id: 'waktu-layanan',
      heading: 'Jam Operasional Layanan Pelanggan',
      paragraphs: [
        'Tim Customer Care dan Servis Teknis kami beroperasi pada jadwal berikut:',
        '• Senin – Jumat: Pukul 09:00 – 18:00 WIB',
        '• Sabtu: Pukul 09:00 – 14:00 WIB',
        '• Minggu & Hari Libur Nasional: Tutup (Layanan email tetap menerima pesan dan akan ditanggapi pada hari kerja berikutnya).'
      ]
    }
  ],
  contactChannels: [
    {
      name: 'Email Dukungan Resmi',
      value: 'support@divoom.com',
      description: 'Pertanyaan seputar pesanan, invoice Duitku, klaim garansi hardware, dan kerjasama bisnis.',
      actionUrl: 'mailto:support@divoom.com',
      badge: 'Email Utama'
    },
    {
      name: 'Pusat Garansi & Service Center',
      value: 'Divoom Authorized Service Support',
      description: 'Layanan inspeksi teknis unit, penggantian suku cadang orisinal, dan klaim RMA garansi 12 bulan.',
      badge: 'Garansi Resmi'
    },
    {
      name: 'Spesifikasi Integrasi & API',
      value: 'Supabase Edge Functions & Duitku POP Gateway',
      description: 'Status sistem backend transaksi beroperasi dengan enkripsi HMAC dan TLS berkeamanan tinggi.',
      badge: 'Sistem Terverifikasi'
    }
  ],
  relatedLinks: [
    { title: 'Pertanyaan Umum (FAQ)', route: '/faq' },
    { title: 'Kebijakan Garansi', route: '/warranty-policy' },
    { title: 'Kebijakan Pengiriman', route: '/shipping-policy' }
  ]
};

export const aboutUsConfig: LegalDocumentConfig = {
  slug: '/about-us',
  title: 'Tentang Divoom Store',
  subtitle: 'Pelopor inovasi perangkat audio retro, layar LED pixel art interaktif, dan aksesoris estetika modern.',
  badge: 'Profil Brand',
  effectiveDate: '01 Januari 2026',
  lastUpdated: '06 November 2026',
  version: '1.5.0',
  sections: [
    {
      id: 'cerita-brand',
      heading: 'Mengenal Divoom',
      paragraphs: [
        'Divoom adalah merek pionir global yang menggabungkan kecintaan terhadap seni retro pixel art dengan teknologi audio modern mutakhir. Sejak awal berdirinya, Divoom terus berinovasi merancang gadget yang tidak hanya memiliki kualitas suara premium, tetapi juga membawa kegembiraan visual ke dalam kehidupan sehari-hari.',
        'Dari seri speaker mechanical keyboard legendaris Ditoo-Pro hingga display bingkai cerdas Pixoo-64 dan backpack berlayar LED, setiap produk Divoom dirancang untuk menginspirasi kreativitas pengguna melalui aplikasi komunitas pixel art nomor satu di dunia.'
      ]
    },
    {
      id: 'komitmen-kami',
      heading: 'Komitmen Kualitas & Pelayanan Kami',
      paragraphs: [
        'Divoom Store hadir untuk memastikan para penggemar pixel art di Indonesia dapat memperoleh produk orisinal dengan jaminan purnajual terpercaya:'
      ],
      bullets: [
        '100% Produk Original dengan garansi resmi 12 bulan.',
        'Sistem belanja aman tanpa ribet dengan Guest Checkout dan Duitku POP payment gateway.',
        'Pengemasan terstandar dan aman dengan tarif flat Rp 52.000 ke seluruh Indonesia.',
        'Dukungan komunitas kreator lokal dan internasional melalui aplikasi mobile Divoom.'
      ]
    }
  ],
  relatedLinks: [
    { title: 'Hubungi Kami', route: '/contact-us' },
    { title: 'Katalog Produk', route: '/products' },
    { title: 'Kebijakan Garansi', route: '/warranty-policy' }
  ]
};
