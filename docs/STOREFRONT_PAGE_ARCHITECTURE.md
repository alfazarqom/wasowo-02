# Storefront UI Page Architecture

**Status:** Approved baseline  
**Version:** V1.2  
**Scope:** Storefront page and layout architecture

Dokumen ini mencatat struktur halaman storefront untuk dua layout: `AppShell` dan `Standalone`. Setiap layout memiliki satu `Footer` bersama. Pada `AppShell`, `BottomComponent` memilih `BottomNavigation` atau `BottomActionBar` sesuai halaman aktif.

## 1. AppShell

### 1.1 Page inventory

| No. | Page | Bottom component |
|---:|---|---|
| 1 | HomePage | BottomNavigation |
| 2 | ProductsPage | BottomNavigation |
| 3 | ProductDetailPage | BottomActionBar |
| 4 | CategoriesPage | BottomNavigation |
| 5 | CategoryDetailPage | BottomNavigation |
| 6 | SearchPage | BottomActionBar |
| 7 | WishlistPage | BottomNavigation |
| 8 | CartPage | BottomActionBar |
| 9 | CheckoutPage | Belum ditetapkan |
| 10 | PaymentPage | Belum ditetapkan |
| 11 | PaymentResultPage | Belum ditetapkan |
| 12 | OrderSuccessPage | Belum ditetapkan |
| 13 | ProfilePage | BottomNavigation |
| 14 | EditProfilePage | Belum ditetapkan |
| 15 | AddressPage | Belum ditetapkan |
| 16 | OrdersPage | BottomNavigation |
| 17 | OrderDetailPage | Belum ditetapkan |
| 18 | OrderTrackingPage | Belum ditetapkan |
| 19 | ReturnRefundPage | Belum ditetapkan |

**Catatan:** Penetapan BottomNavigation untuk HomePage, ProductsPage, CategoriesPage, CategoryDetailPage, WishlistPage, ProfilePage, dan OrdersPage; serta BottomActionBar untuk ProductDetailPage, SearchPage, dan CartPage tercatat pada baseline yang tersedia. Penetapan untuk halaman lainnya belum dapat diverifikasi dari keputusan yang tersedia dan tidak diasumsikan dalam dokumen ini.

### 1.2 Structure tree

```text
AppShell
├── Header
├── MainPage
│   ├── HomePage
│   ├── ProductsPage
│   ├── ProductDetailPage
│   ├── CategoriesPage
│   ├── CategoryDetailPage
│   ├── SearchPage
│   ├── WishlistPage
│   ├── CartPage
│   ├── CheckoutPage
│   ├── PaymentPage
│   ├── PaymentResultPage
│   ├── OrderSuccessPage
│   ├── ProfilePage
│   ├── EditProfilePage
│   ├── AddressPage
│   ├── OrdersPage
│   ├── OrderDetailPage
│   ├── OrderTrackingPage
│   └── ReturnRefundPage
├── Footer
├── BottomComponent
│   ├── BottomNavigation
│   └── BottomActionBar
└── Overlays
    ├── Modal
    ├── ProductQuickView
    ├── ImageGalleryModal
    ├── ConfirmDialog
    ├── Drawer
    ├── CartDrawer
    ├── WishlistDrawer
    ├── FilterDrawer
    ├── BottomSheet
    ├── SortBottomSheet
    └── FilterBottomSheet
```

### 1.3 Layout rules

- `Header` dan `Footer` digunakan bersama oleh seluruh halaman di dalam `AppShell`.
- `Footer` hanya dirender satu kali pada level layout, bukan diduplikasi di setiap Page.
- `BottomComponent` merupakan slot kondisional: hanya salah satu dari `BottomNavigation` atau `BottomActionBar` yang ditampilkan sesuai Page aktif.
- `Overlays` dikelola pada level `AppShell`, di luar konten halaman/routing.

## 2. Standalone

### 2.1 Page inventory

| No. | Page |
|---:|---|
| 1 | AboutPage |
| 2 | ContactPage |
| 3 | FAQPage |
| 4 | HelpPage |
| 5 | ShippingPolicyPage |
| 6 | ReturnPolicyPage |
| 7 | PrivacyPolicyPage |
| 8 | TermsPage |
| 9 | NotFoundPage |
| 10 | OfflinePage |
| 11 | MaintenancePage |

### 2.2 Structure tree

```text
Standalone
├── Header
├── StandalonePage
│   ├── AboutPage
│   ├── ContactPage
│   ├── FAQPage
│   ├── HelpPage
│   ├── ShippingPolicyPage
│   ├── ReturnPolicyPage
│   ├── PrivacyPolicyPage
│   ├── TermsPage
│   ├── NotFoundPage
│   ├── OfflinePage
│   └── MaintenancePage
├── Footer
└── BottomActionBar
```

### 2.3 Layout rules

- `Header`, `Footer`, dan `BottomActionBar` berada pada level layout `Standalone`.
- `Footer` hanya dirender satu kali dan digunakan bersama oleh seluruh halaman `Standalone`.
- Halaman Standalone tidak menduplikasi komponen layout bersama di dalam masing-masing Page.

---

## 3. Page count

| Layout | Page count |
|---|---:|
| AppShell | 19 |
| Standalone | 11 |
| **Total** | **30** |
