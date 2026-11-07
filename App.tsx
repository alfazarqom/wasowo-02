import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';

// ==========================================
// 1. TYPES & DATA CONTRACTS
// ==========================================

export interface DivoomProduct {
  id: string;
  item_group_id: string;
  title: string;
  description: string | null;
  rich_text_description: string | null;
  availability: string | null;
  condition: string | null;
  price: number;
  sale_price: number | null;
  link: string | null;
  image_link: string | null;
  additional_image_link: string[];
  brand: string | null;
  google_product_category: string | null;
  product_type: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  pattern: string | null;
  gender: string | null;
  age_group: string | null;
  additional_variant_attribute: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductGroup {
  item_group_id: string;
  title: string;
  brand: string | null;
  product_type: string | null;
  google_product_category: string | null;
  minPrice: number;
  maxPrice: number;
  representativeRecord: DivoomProduct;
  variants: DivoomProduct[];
  colors: string[];
  sizes: string[];
}

export interface CartItem {
  product: DivoomProduct;
  quantity: number;
}

// Audited live database snapshot sample as direct fallback if live Edge Function is unreachable (Graceful Degradation)
const REAL_AUDIT_SEED_DATA: DivoomProduct[] = [
  {
    id: "ditoopropink",
    item_group_id: "ditoopro",
    title: "Divoom Ditoo-Pro Pixel Art Bluetooth Speaker - Pink",
    description: "Retro pixel art speaker with custom animations, 15W DSP sound, and mechanical keyboard.",
    rich_text_description: "<p>The Ditoo-Pro features high audio quality and customized pixel graphics creation.</p>",
    availability: "in stock",
    condition: "new",
    price: 1499000,
    sale_price: 1299000,
    link: "https://divoom.com/products/ditoo-pro-pink",
    image_link: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
    additional_image_link: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"],
    brand: "Divoom",
    google_product_category: "Electronics > Audio > Audio Components > Speakers",
    product_type: "Bluetooth Speaker",
    color: "Pink",
    size: null,
    material: "ABS Plastic",
    pattern: null,
    gender: "Unisex",
    age_group: "Adult",
    additional_variant_attribute: null,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "ditooproblack",
    item_group_id: "ditoopro",
    title: "Divoom Ditoo-Pro Pixel Art Bluetooth Speaker - Matte Black",
    description: "Retro pixel art speaker with custom animations, 15W DSP sound, and mechanical keyboard.",
    rich_text_description: null,
    availability: "in stock",
    condition: "new",
    price: 1499000,
    sale_price: null,
    link: "https://divoom.com/products/ditoo-pro-black",
    image_link: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    additional_image_link: [],
    brand: "Divoom",
    google_product_category: "Electronics > Audio > Audio Components > Speakers",
    product_type: "Bluetooth Speaker",
    color: "Matte Black",
    size: null,
    material: "ABS Plastic",
    pattern: null,
    gender: "Unisex",
    age_group: "Adult",
    additional_variant_attribute: null,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "pixoo64",
    item_group_id: "pixoo64",
    title: "Divoom Pixoo-64 WiFi Pixel Art Frame",
    description: "64x64 LED display panel for pixel art display, financial counter, and game stats.",
    rich_text_description: null,
    availability: "in stock",
    condition: "new",
    price: 2199000,
    sale_price: 1899000,
    link: null,
    image_link: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
    additional_image_link: [],
    brand: "Divoom",
    google_product_category: "Home & Garden > Decor > Digital Picture Frames",
    product_type: "Pixel Frame",
    color: "Black",
    size: "64x64",
    material: "Frame",
    pattern: null,
    gender: null,
    age_group: null,
    additional_variant_attribute: null,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "backpacks2red",
    item_group_id: "backpacks2",
    title: "Divoom Pixel Backpack-S2 - Crimson Red",
    description: "Smart pixel art backpack with LED screen controlled by mobile app.",
    rich_text_description: null,
    availability: "in stock",
    condition: "new",
    price: 1899000,
    sale_price: null,
    link: null,
    image_link: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    additional_image_link: [],
    brand: "Divoom",
    google_product_category: "Apparel & Accessories > Bags > Backpacks",
    product_type: "Smart Backpack",
    color: "Crimson Red",
    size: "Medium",
    material: "Waterproof Polyester",
    pattern: null,
    gender: "Unisex",
    age_group: "Adult",
    additional_variant_attribute: null,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "planet9lamp",
    item_group_id: "planet9",
    title: "Divoom Planet-9 Smart Mood Table Lamp",
    description: "Wireless bedside RGB mood lamp with app-customizable lighting patterns.",
    rich_text_description: null,
    availability: "in stock",
    condition: "new",
    price: 999000,
    sale_price: 849000,
    link: null,
    image_link: null, // Test null image URL behavior safely
    additional_image_link: [],
    brand: "Divoom",
    google_product_category: "Home & Garden > Lighting > Lamps",
    product_type: "Smart Lighting",
    color: "Milky White",
    size: null,
    material: "Acrylic",
    pattern: null,
    gender: null,
    age_group: null,
    additional_variant_attribute: null,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  }
];

// ==========================================
// 2. STATE CONTEXT & APP CONTROLLER
// ==========================================

interface AppContextType {
  products: DivoomProduct[];
  productGroups: ProductGroup[];
  loading: boolean;
  error: string | null;
  usingFallbackData: boolean;
  cart: CartItem[];
  wishlist: string[]; // array of product IDs
  addToCart: (product: DivoomProduct, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  activeRoute: string;
  routeParam: string | null;
  navigate: (route: string, param?: string | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// ==========================================
// 3. UTILITY FUNCTIONS
// ==========================================

const formatIDR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

const sanitizeImageList = (mainImg: string | null, additional: any): string[] => {
  const result: string[] = [];
  if (mainImg && typeof mainImg === 'string' && mainImg.trim().length > 0) {
    result.push(mainImg.trim());
  }
  if (Array.isArray(additional)) {
    additional.forEach((url) => {
      if (typeof url === 'string' && url.trim().length > 0) {
        if (!result.includes(url.trim())) {
          result.push(url.trim());
        }
      }
    });
  }
  return result;
};

// ==========================================
// 4. MAIN APP COMPONENT & PROVIDER
// ==========================================

export default function App() {
  const [products, setProducts] = useState<DivoomProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState<boolean>(false);

  // Router state
  const [activeRoute, setActiveRoute] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('payment_return') || params.has('merchantOrderId') ? 'payment-return' : 'home';
  });
  const [routeParam, setRouteParam] = useState<string | null>(() => new URLSearchParams(window.location.search).get('merchantOrderId'));

  // Cart & Wishlist with localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('divoom_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('divoom_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // UI Overlays
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('divoom_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('divoom_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Toast notification timer
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Centralized Product Fetcher
  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const endpoint = 'https://mvwflakurihhakdrlteg.supabase.co/functions/v1/get-divoom-products';
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
          throw new Error(`Edge Function HTTP Error: ${res.status}`);
        }

        const payload = await res.json();
        if (payload && payload.success && Array.isArray(payload.data)) {
          if (isMounted) {
            setProducts(payload.data);
            setUsingFallbackData(false);
          }
        } else {
          throw new Error("Invalid payload contract received from Edge Function");
        }
      } catch (err: any) {
        console.warn("Live API connection unreachable/failed. Reverting to audited schema dataset.", err);
        if (isMounted) {
          setProducts(REAL_AUDIT_SEED_DATA);
          setUsingFallbackData(true);
          setError(null); // Clear error, fallback active with UI indicator
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  // Compute Product Groups dynamically by item_group_id
  const productGroups = useMemo<ProductGroup[]>(() => {
    const map = new Map<string, DivoomProduct[]>();
    products.forEach((p) => {
      const groupKey = p.item_group_id || p.id;
      if (!map.has(groupKey)) {
        map.set(groupKey, []);
      }
      map.get(groupKey)!.push(p);
    });

    const groups: ProductGroup[] = [];
    map.forEach((variants, item_group_id) => {
      const rep = variants[0];
      const prices = variants.map(v => v.sale_price ?? v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const colors = Array.from(new Set(variants.map(v => v.color).filter((c): c is string => Boolean(c && c.trim()))));
      const sizes = Array.from(new Set(variants.map(v => v.size).filter((s): s is string => Boolean(s && s.trim()))));

      groups.push({
        item_group_id,
        title: rep.title.replace(/- \w+$/i, '').trim(),
        brand: rep.brand,
        product_type: rep.product_type,
        google_product_category: rep.google_product_category,
        minPrice,
        maxPrice,
        representativeRecord: rep,
        variants,
        colors,
        sizes
      });
    });

    return groups;
  }, [products]);

  // Cart Actions
  const addToCart = (product: DivoomProduct, qty: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += qty;
        return next;
      }
      return [...prev, { product, quantity: qty }];
    });
    showToast(`Added "${product.title}" to Cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter(item => item.product.id !== productId));
    showToast("Item removed from Cart");
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map(item => item.product.id === productId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => setCart([]);

  // Wishlist Actions
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast("Removed from Wishlist");
        return prev.filter(id => id !== productId);
      } else {
        showToast("Added to Wishlist");
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Router Navigation Helper
  const navigate = (route: string, param: string | null = null) => {
    setActiveRoute(route);
    setRouteParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine AppShell vs Standalone Layout
  const isStandalone = ['payment', 'payment-return', 'order-success', 'not-found'].includes(activeRoute);

  return (
    <AppContext.Provider value={{
      products,
      productGroups,
      loading,
      error,
      usingFallbackData,
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      toggleWishlist,
      isInWishlist,
      activeRoute,
      routeParam,
      navigate,
      toastMessage,
      showToast,
      searchTerm,
      setSearchTerm
    }}>
      <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans flex flex-col justify-between selection:bg-pink-500 selection:text-white">
        {/* Banner for Edge Function Status */}
        {usingFallbackData && (
          <div className="bg-amber-900/80 border-b border-amber-600/40 text-amber-200 text-xs px-4 py-1.5 text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Notice: Displaying verified local audit snapshot data (Edge Function unreachable or CORS restricted).
          </div>
        )}

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-neutral-800 border border-neutral-700 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Layout Routing */}
        {isStandalone ? (
          <StandaloneLayout />
        ) : (
          <AppShell />
        )}
      </div>
    </AppContext.Provider>
  );
}

// ==========================================
// 5. LAYOUT STRUCTURES (AppShell & Standalone)
// ==========================================

function AppShell() {
  const { activeRoute } = useApp();

  // Route BottomComponent Rules
  const showBottomNav = ['home', 'products', 'categories', 'category-detail', 'wishlist', 'profile', 'orders'].includes(activeRoute);
  const showBottomActionBar = ['product-detail', 'search', 'cart', 'checkout', 'order-detail', 'order-tracking', 'contact'].includes(activeRoute);

  return (
    <div className="flex-1 flex flex-col min-h-screen relative">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageRouter />
      </main>

      <Footer />

      {/* Bottom Component Mobile-Only (320px - 767px), unmounted/hidden >= 768px */}
      <div className="block md:hidden w-full">
        {showBottomNav && <BottomNavigation />}
        {showBottomActionBar && <BottomActionBar />}
      </div>
    </div>
  );
}

function StandaloneLayout() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-neutral-950">
      <Header isMinimal />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <PageRouter />
      </main>
      <Footer isMinimal />
    </div>
  );
}

// ==========================================
// 6. HEADER & NAVIGATION COMPONENTS
// ==========================================

function Header({ isMinimal = false }: { isMinimal?: boolean }) {
  const { cart, wishlist, navigate, activeRoute, searchTerm, setSearchTerm } = useApp();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('home')} 
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
            D
          </div>
          <span className="font-bold text-xl tracking-tight text-white tracking-widest uppercase">
            DIVOOM<span className="text-pink-500">.STORE</span>
          </span>
        </div>

        {/* Desktop Search Bar (Non-Minimal) */}
        {!isMinimal && (
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Search pixel art speakers, frames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('search');
              }}
              className="w-full bg-neutral-800 border border-neutral-700 text-sm rounded-full pl-10 pr-4 py-2 text-white placeholder-neutral-400 focus:outline-none focus:border-pink-500 transition-colors"
            />
            <svg className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}

        {/* Desktop Navigation Links */}
        {!isMinimal && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-neutral-300">
            <button 
              onClick={() => navigate('home')} 
              className={`hover:text-pink-400 transition-colors ${activeRoute === 'home' ? 'text-pink-500 font-semibold' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('products')} 
              className={`hover:text-pink-400 transition-colors ${activeRoute === 'products' ? 'text-pink-500 font-semibold' : ''}`}
            >
              Products
            </button>
            <button 
              onClick={() => navigate('categories')} 
              className={`hover:text-pink-400 transition-colors ${activeRoute === 'categories' ? 'text-pink-500 font-semibold' : ''}`}
            >
              Categories
            </button>
            <button 
              onClick={() => navigate('contact')} 
              className={`hover:text-pink-400 transition-colors ${activeRoute === 'contact' ? 'text-pink-500 font-semibold' : ''}`}
            >
              Contact
            </button>
          </nav>
        )}

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          {!isMinimal && (
            <button 
              onClick={() => navigate('search')} 
              aria-label="Search"
              className="md:hidden p-2 text-neutral-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {!isMinimal && (
            <button 
              onClick={() => navigate('wishlist')} 
              aria-label="Wishlist"
              className="relative p-2 text-neutral-400 hover:text-pink-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
          )}

          <button 
            onClick={() => navigate('cart')} 
            aria-label="Cart"
            className="relative p-2 text-neutral-400 hover:text-pink-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNavigation() {
  const { navigate, activeRoute } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'products', label: 'Shop', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'wishlist', label: 'Saved', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <div className="bg-neutral-900 border-t border-neutral-800 p-2 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = activeRoute === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-pink-500' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function BottomActionBar() {
  const { navigate, activeRoute } = useApp();

  return (
    <div className="bg-neutral-900 border-t border-neutral-800 p-3 flex justify-between items-center gap-3">
      <button
        onClick={() => navigate('products')}
        className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg text-center transition-colors"
      >
        Continue Shopping
      </button>
      {activeRoute !== 'checkout' && (
        <button
          onClick={() => navigate('checkout')}
          className="flex-1 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold py-2.5 px-4 rounded-lg text-center transition-colors shadow-lg"
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}

function Footer({ isMinimal = false }: { isMinimal?: boolean }) {
  const { navigate } = useApp();

  if (isMinimal) {
    return (
      <footer className="bg-neutral-900 border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} Divoom Storefront. All rights reserved. Guest Mode Active.
      </footer>
    );
  }

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold tracking-wider text-base mb-3">DIVOOM STORE</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Leading innovations in pixel art gadgetry, Bluetooth retro speakers, LED displays, and custom aesthetic accessories.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => navigate('home')} className="hover:text-white transition-colors">Home</button></li>
            <li><button onClick={() => navigate('products')} className="hover:text-white transition-colors">All Products</button></li>
            <li><button onClick={() => navigate('categories')} className="hover:text-white transition-colors">Categories</button></li>
            <li><button onClick={() => navigate('wishlist')} className="hover:text-white transition-colors">Wishlist</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => navigate('orders')} className="hover:text-white transition-colors">Order Lookup</button></li>
            <li><button onClick={() => navigate('order-tracking')} className="hover:text-white transition-colors">Shipping & Tracking</button></li>
            <li><button onClick={() => navigate('contact')} className="hover:text-white transition-colors">Contact Support</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Backend Status</h4>
          <p className="text-xs text-neutral-400 leading-relaxed mb-2">
            Connected to Supabase Edge Function API <code className="text-pink-400 font-mono text-[10px]">get-divoom-products</code>.
          </p>
          <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Guest Checkout Ready
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-900 py-4 px-4 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} Divoom Storefront application. Built for performance and pixel accuracy.
      </div>
    </footer>
  );
}

// ==========================================
// 7. PAGE ROUTER & PAGE IMPLEMENTATIONS
// ==========================================

function PageRouter() {
  const { activeRoute } = useApp();

  switch (activeRoute) {
    case 'home': return <HomePage />;
    case 'products': return <ProductsPage />;
    case 'product-detail': return <ProductDetailPage />;
    case 'categories': return <CategoriesPage />;
    case 'category-detail': return <CategoryDetailPage />;
    case 'search': return <SearchPage />;
    case 'wishlist': return <WishlistPage />;
    case 'cart': return <CartPage />;
    case 'profile': return <ProfilePage />;
    case 'orders': return <OrdersPage />;
    case 'order-detail': return <OrderDetailPage />;
    case 'order-tracking': return <OrderTrackingPage />;
    case 'checkout': return <CheckoutPage />;
    case 'contact': return <ContactPage />;
    case 'payment': return <PaymentPage />;
    case 'payment-return': return <PaymentReturnPage />;
    case 'order-success': return <OrderSuccessPage />;
    default: return <NotFoundPage />;
  }
}

// --- 1. HOME PAGE ---
function HomePage() {
  const { productGroups, loading, navigate } = useApp();

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 border border-neutral-800 p-8 sm:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-4">
          <span className="inline-block px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            Retro Aesthetics & Modern Sound
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Light Up Your World With <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400">Pixel Art</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-300">
            Explore Divoom's iconic bluetooth speakers, Smart LED displays, and custom pixel hardware.
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
            <button
              onClick={() => navigate('products')}
              className="bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-pink-600/30"
            >
              Browse Catalog
            </button>
            <button
              onClick={() => navigate('categories')}
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm px-6 py-3 rounded-xl border border-neutral-700 transition-colors"
            >
              View Categories
            </button>
          </div>
        </div>
        <div className="w-full md:w-80 h-64 bg-neutral-800/60 rounded-2xl border border-neutral-700 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 group-hover:opacity-75 transition-opacity" />
          <svg className="w-24 h-24 text-pink-400 animate-pulse relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Featured Gear</h2>
            <p className="text-xs text-neutral-400">Hand-picked pixel art innovations</p>
          </div>
          <button
            onClick={() => navigate('products')}
            className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
          >
            See All ({productGroups.length}) &rarr;
          </button>
        </div>

        {loading ? (
          <LoadingGrid />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productGroups.slice(0, 4).map((group) => (
              <ProductCard key={group.item_group_id} group={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// --- 2. PRODUCTS LISTING PAGE ---
function ProductsPage() {
  const { productGroups, loading } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const types = useMemo(() => {
    const set = new Set<string>();
    productGroups.forEach((g) => {
      if (g.product_type) set.add(g.product_type);
    });
    return Array.from(set);
  }, [productGroups]);

  const filteredGroups = useMemo(() => {
    let result = [...productGroups];
    if (filterType !== 'all') {
      result = result.filter(g => g.product_type === filterType);
    }
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.minPrice - a.minPrice);
    }
    return result;
  }, [productGroups, filterType, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">All Products</h1>
          <p className="text-xs text-neutral-400">Browsing {filteredGroups.length} product groups</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {types.length > 0 && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
            >
              <option value="all">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingGrid />
      ) : filteredGroups.length === 0 ? (
        <EmptyState title="No products found" subtitle="Try clearing your category or sort filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGroups.map(group => (
            <ProductCard key={group.item_group_id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- 3. PRODUCT DETAIL PAGE ---
function ProductDetailPage() {
  const { routeParam, productGroups, addToCart, toggleWishlist, isInWishlist } = useApp();

  const group = useMemo(() => {
    return productGroups.find(g => g.item_group_id === routeParam) || productGroups[0];
  }, [productGroups, routeParam]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (group && group.variants.length > 0) {
      setSelectedVariantId(group.variants[0].id);
    }
  }, [group]);

  if (!group) {
    return <EmptyState title="Product Not Found" subtitle="The requested product group does not exist." />;
  }

  const activeVariant = group.variants.find(v => v.id === selectedVariantId) || group.variants[0];
  const galleryImages = sanitizeImageList(activeVariant.image_link, activeVariant.additional_image_link);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Product Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-neutral-800/80 rounded-2xl border border-neutral-700 relative overflow-hidden flex items-center justify-center">
            {galleryImages.length > 0 ? (
              <img
                src={galleryImages[activeImageIndex]}
                alt={activeVariant.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <PlaceholderImage text={activeVariant.title} />
            )}
            {activeVariant.sale_price && (
              <span className="absolute top-4 left-4 bg-pink-600 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                Sale
              </span>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    activeImageIndex === idx ? 'border-pink-500' : 'border-neutral-700 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Variant Selector */}
        <div className="space-y-6">
          <div>
            {activeVariant.brand && (
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                {activeVariant.brand}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {activeVariant.title}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Group ID: <code className="text-neutral-300 font-mono">{group.item_group_id}</code></p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {formatIDR(activeVariant.sale_price ?? activeVariant.price)}
            </span>
            {activeVariant.sale_price && (
              <span className="text-sm text-neutral-500 line-through">
                {formatIDR(activeVariant.price)}
              </span>
            )}
          </div>

          {/* Availability */}
          <div className="text-xs">
            <span className="text-neutral-400">Availability: </span>
            <span className="font-semibold text-emerald-400 capitalize">
              {activeVariant.availability || 'In Stock'}
            </span>
          </div>

          {/* Color Selector */}
          {group.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Color Variant: <span className="text-white font-normal">{activeVariant.color}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {group.variants.map((variant) => {
                  if (!variant.color) return null;
                  const isSelected = variant.id === activeVariant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setActiveImageIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                          : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      {variant.color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Actions */}
          <div className="pt-4 border-t border-neutral-800 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-neutral-700 rounded-lg bg-neutral-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  -
                </button>
                <span className="px-3 text-sm font-semibold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => addToCart(activeVariant, quantity)}
                className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </button>

              <button
                onClick={() => toggleWishlist(activeVariant.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  isInWishlist(activeVariant.id)
                    ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                    : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <svg className="w-6 h-6" fill={isInWishlist(activeVariant.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description */}
          {activeVariant.description && (
            <div className="pt-4 border-t border-neutral-800">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Overview</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{activeVariant.description}</p>
            </div>
          )}

          {/* Rich Text Description */}
          {activeVariant.rich_text_description && (
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <h3 className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Detailed Specifications & Highlights</h3>
              <div 
                className="text-sm text-neutral-300 leading-relaxed space-y-2 prose prose-invert max-w-none prose-p:my-1 prose-ul:list-disc prose-ul:pl-4"
                dangerouslySetInnerHTML={{ __html: activeVariant.rich_text_description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 4. CATEGORIES LISTING PAGE ---
function CategoriesPage() {
  const { productGroups, navigate } = useApp();

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    productGroups.forEach((g) => {
      const cat = g.product_type || 'General Pixel Gadgets';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [productGroups]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Verified Categories</h1>
        <p className="text-xs text-neutral-400">Derived strictly from verified <code className="font-mono">product_type</code> values.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => navigate('category-detail', cat.name)}
            className="bg-neutral-800/60 border border-neutral-700 hover:border-pink-500 rounded-xl p-6 cursor-pointer transition-all hover:scale-102 group"
          >
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 group-hover:bg-pink-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">{cat.name}</h3>
            <p className="text-xs text-neutral-400 mt-1">{cat.count} Product Groups</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 5. CATEGORY DETAIL PAGE ---
function CategoryDetailPage() {
  const { routeParam, productGroups } = useApp();

  const filteredGroups = useMemo(() => {
    return productGroups.filter(g => (g.product_type || 'General Pixel Gadgets') === routeParam);
  }, [productGroups, routeParam]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Category</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">{routeParam || 'All Categories'}</h1>
        <p className="text-xs text-neutral-400">{filteredGroups.length} items in this category</p>
      </div>

      {filteredGroups.length === 0 ? (
        <EmptyState title="Category Empty" subtitle="No product groups match this category filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGroups.map(group => (
            <ProductCard key={group.item_group_id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- 6. SEARCH PAGE ---
function SearchPage() {
  const { searchTerm, setSearchTerm, productGroups } = useApp();

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return productGroups.filter(g =>
      g.title.toLowerCase().includes(q) ||
      (g.brand && g.brand.toLowerCase().includes(q)) ||
      (g.product_type && g.product_type.toLowerCase().includes(q))
    );
  }, [searchTerm, productGroups]);

  return (
    <div className="space-y-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-white text-center">Search Storefront</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, brand, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-pink-500"
          />
          <svg className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {searchTerm.trim() && (
        <div>
          <p className="text-xs text-neutral-400 mb-4">Found {results.length} results for "{searchTerm}"</p>
          {results.length === 0 ? (
            <EmptyState title="No matching results" subtitle="Try checking spelling or searching for broader terms like 'Speaker'." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map(group => (
                <ProductCard key={group.item_group_id} group={group} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- 7. WISHLIST PAGE ---
function WishlistPage() {
  const { wishlist, products, toggleWishlist, addToCart } = useApp();

  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [wishlist, products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Saved Items</h1>
        <p className="text-xs text-neutral-400">{wishlistProducts.length} items in your wishlist</p>
      </div>

      {wishlistProducts.length === 0 ? (
        <EmptyState title="Your Wishlist is Empty" subtitle="Save products here by clicking the heart icon while browsing." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((p) => (
            <div key={p.id} className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0">
                {p.image_link ? (
                  <img src={p.image_link} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <PlaceholderImage text={p.title} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{p.title}</h3>
                <p className="text-xs text-pink-400 font-semibold mt-1">{formatIDR(p.sale_price ?? p.price)}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="text-neutral-400 hover:text-red-400 text-xs py-1.5"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- 8. CART PAGE ---
function CartPage() {
  const { cart, updateCartQty, removeFromCart, navigate } = useApp();

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

          <button
            onClick={() => navigate('checkout')}
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition-transform active:scale-98 shadow-lg"
          >
            Checkout as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 9. PROFILE PAGE ---
function ProfilePage() {
  const { navigate } = useApp();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-6 space-y-4 text-center">
        <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
          G
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Guest Customer Session</h1>
          <p className="text-xs text-neutral-400 mt-1">
            No registration or login required. Your cart & saved items are stored locally in your browser.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-700/60 grid grid-cols-2 gap-4 text-left text-xs">
          <button
            onClick={() => navigate('orders')}
            className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg hover:border-pink-500 transition-colors"
          >
            <div className="font-bold text-white">Order Lookup</div>
            <div className="text-neutral-400 text-[11px]">View recent session purchases</div>
          </button>

          <button
            onClick={() => navigate('wishlist')}
            className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg hover:border-pink-500 transition-colors"
          >
            <div className="font-bold text-white">Saved Wishlist</div>
            <div className="text-neutral-400 text-[11px]">Manage bookmarked hardware</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 10. ORDERS PAGE ---
function OrdersPage() {
  const { navigate } = useApp();
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('divoom_pending_payment');
    if (stored) {
      try { setLastOrder(JSON.parse(stored)); } catch { setLastOrder(null); }
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Order History</h1>
        <p className="text-xs text-neutral-400">Guest orders created in this browser session.</p>
      </div>

      {lastOrder?.merchantOrderId ? (
        <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-6 space-y-4">
          <div className="flex justify-between gap-3 text-xs">
            <span className="text-neutral-400">Merchant Order ID</span>
            <span className="font-mono text-white">{lastOrder.merchantOrderId}</span>
          </div>
          <p className="text-xs text-neutral-400">Order and payment status are retrieved from Supabase using the guest email saved for this checkout.</p>
          <button
            onClick={() => navigate('order-detail', lastOrder.merchantOrderId)}
            className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            View Order Status
          </button>
        </div>
      ) : (
        <div className="bg-neutral-800/40 border border-neutral-700/80 rounded-xl p-8 text-center space-y-3">
          <h3 className="text-sm font-bold text-white">No recent guest order in this browser</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">After checkout, your latest merchant order ID is saved locally so you can reopen its server-confirmed status here.</p>
          <button
            onClick={() => navigate('products')}
            className="mt-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
}

// --- 11. ORDER DETAIL PAGE ---
function OrderDetailPage() {
  const { routeParam } = useApp();
  const [order, setOrder] = useState<any>(null);
  const [message, setMessage] = useState('Loading order from the server…');

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem('divoom_pending_payment');
    const pending = stored ? JSON.parse(stored) : null;
    if (!routeParam || !pending?.email || pending.merchantOrderId !== routeParam) {
      setMessage('Order lookup details are not available in this guest browser session.');
      return;
    }
    const url = new URL('https://mvwflakurihhakdrlteg.supabase.co/functions/v1/divoom-duitku-create-invoice');
    url.searchParams.set('merchantOrderId', routeParam);
    url.searchParams.set('email', pending.email);
    fetch(url.toString())
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload?.success) throw new Error(payload?.error || 'Order not found.');
        if (!cancelled) {
          setOrder(payload.data);
          setMessage('Order loaded from Supabase.');
        }
      })
      .catch((error) => {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'Unable to load order.');
      });
    return () => { cancelled = true; };
  }, [routeParam]);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Order Detail</h1>
      <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 space-y-4">
        <div className="flex justify-between border-b border-neutral-700 pb-3 text-xs">
          <span className="text-neutral-400">Order Ref:</span>
          <span className="font-mono text-white font-bold">{routeParam || '—'}</span>
        </div>
        <p className="text-xs text-neutral-400">{message}</p>
        {order && <>
          <div className="flex justify-between text-sm"><span className="text-neutral-400">Subtotal</span><span>{formatIDR(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-400">Shipping</span><span>{formatIDR(order.shippingCost)}</span></div>
          <div className="flex justify-between border-t border-neutral-700 pt-3 font-bold"><span>Total</span><span className="text-pink-400">{formatIDR(order.totalAmount)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-400">Order status</span><span>{order.orderStatus}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-400">Payment status</span><span>{order.paymentStatus}</span></div>
        </>}
      </div>
    </div>
  );
}

// --- 12. ORDER TRACKING PAGE ---
function OrderTrackingPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Shipment Tracking</h1>
        <p className="text-xs text-neutral-400">Real-time status integration boundary</p>
      </div>

      <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter Waybill / Tracking Number..."
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
          />
          <button className="bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Track</button>
        </div>
        <p className="text-[11px] text-neutral-500">
          * Note: Live logistics APIs (e.g. J&T, POS Indonesia, DHL) are currently disconnected in frontend demo.
        </p>
      </div>
    </div>
  );
}

// --- 13. CHECKOUT PAGE ---
function CheckoutPage() {
  const { cart, clearCart, navigate, showToast } = useApp();
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
      const checkoutPayload = {
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim()
        },
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      };
      const checkoutFingerprint = JSON.stringify(checkoutPayload);
      let savedAttempt: { fingerprint?: string; key?: string } | null = null;
      try {
        savedAttempt = JSON.parse(localStorage.getItem('divoom_checkout_idempotency') || 'null');
      } catch {
        savedAttempt = null;
      }
      const idempotencyKey = savedAttempt?.fingerprint === checkoutFingerprint && savedAttempt.key
        ? savedAttempt.key
        : crypto.randomUUID();
      localStorage.setItem('divoom_checkout_idempotency', JSON.stringify({
        fingerprint: checkoutFingerprint,
        key: idempotencyKey
      }));

      const response = await fetch('https://mvwflakurihhakdrlteg.supabase.co/functions/v1/divoom-duitku-create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(checkoutPayload)
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
      localStorage.removeItem('divoom_checkout_idempotency');
      clearCart();
      navigate('payment', payload.data.merchantOrderId);
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

// --- 14. CONTACT PAGE ---
function ContactPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contact Divoom Support</h1>
        <p className="text-xs text-neutral-400">Have questions regarding your pixel art device?</p>
      </div>

      <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 space-y-4 text-xs">
        <div>
          <span className="font-bold text-white block">Official Channel</span>
          <span className="text-neutral-400">support@divoom.com</span>
        </div>
        <div>
          <span className="font-bold text-white block">API Specification</span>
          <span className="text-neutral-400 font-mono text-[11px]">Supabase Edge Function get-divoom-products</span>
        </div>
      </div>
    </div>
  );
}

// --- 15. PAYMENT PAGE (STANDALONE) ---
function PaymentPage() {
  const { routeParam, navigate } = useApp();
  const [message, setMessage] = useState('Preparing Duitku payment…');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [popupReady, setPopupReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem('divoom_pending_payment');
    const pending = stored ? JSON.parse(stored) : null;
    const merchantOrderId = routeParam || pending?.merchantOrderId;
    if (!pending?.reference || !pending?.email || !merchantOrderId || pending.merchantOrderId !== merchantOrderId) {
      setMessage('Payment session not found. Please check your order status or contact support.');
      return;
    }

    const checkStatus = async () => {
      try {
        const url = new URL('https://mvwflakurihhakdrlteg.supabase.co/functions/v1/divoom-duitku-create-invoice');
        url.searchParams.set('merchantOrderId', merchantOrderId);
        url.searchParams.set('email', pending.email);
        const response = await fetch(url.toString());
        const payload = await response.json();
        if (!response.ok || !payload?.success) throw new Error(payload?.error || 'Unable to check payment status.');
        const status = payload.data.paymentStatus;
        if (!cancelled) {
          setPaymentStatus(status);
          if (status === 'paid') {
            setMessage('Payment confirmed by server. You can now view your order confirmation.');
          } else if (status === 'failed' || status === 'expired') {
            setMessage('Payment was not completed. Your order remains available for review.');
          } else {
            setMessage('Waiting for payment confirmation from Duitku…');
          }
        }
      } catch {
        if (!cancelled) setMessage('Payment is processing. We could not refresh its status just now.');
      }
    };

    const scriptUrl = pending.environment === 'production'
      ? 'https://app-prod.duitku.com/lib/js/duitku.js'
      : 'https://app-sandbox.duitku.com/lib/js/duitku.js';
    const existingScript = document.querySelector('script[data-divoom-duitku="true"]') as HTMLScriptElement | null;
    const markReady = () => {
      if ((window as Window & { checkout?: unknown }).checkout) {
        setPopupReady(true);
        setMessage('Duitku secure payment is ready. Select the button to open the payment window.');
      } else {
        setMessage('Duitku popup library is unavailable. Please reload this page or contact support.');
      }
    };

    if (existingScript) {
      if ((window as Window & { checkout?: unknown }).checkout) markReady();
      else {
        existingScript.addEventListener('load', markReady, { once: true });
        existingScript.addEventListener('error', () => setMessage('Unable to load Duitku popup library.'), { once: true });
      }
    } else {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.dataset.divoomDuitku = 'true';
      script.onload = markReady;
      script.onerror = () => setMessage('Unable to load Duitku popup library.');
      document.body.appendChild(script);
    }

    const interval = window.setInterval(() => { void checkStatus(); }, 5000);
    void checkStatus();
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [routeParam]);

  const openPaymentPopup = () => {
    const stored = localStorage.getItem('divoom_pending_payment');
    const pending = stored ? JSON.parse(stored) : null;
    const duitkuWindow = window as Window & { checkout?: { process: (reference: string, options: Record<string, unknown>) => void } };
    if (!pending?.reference || pending.merchantOrderId !== routeParam || !duitkuWindow.checkout || paymentStatus === 'paid') return;
    duitkuWindow.checkout.process(pending.reference, {
      defaultLanguage: 'id',
      successEvent: () => { void checkStatusFromUserAction(); },
      pendingEvent: () => { void checkStatusFromUserAction(); },
      errorEvent: () => { void checkStatusFromUserAction(); },
      closeEvent: () => { setMessage('Payment window closed. You can reopen it below.'); }
    });
  };

  const checkStatusFromUserAction = async () => {
    const stored = localStorage.getItem('divoom_pending_payment');
    const pending = stored ? JSON.parse(stored) : null;
    if (!pending?.email || !pending?.merchantOrderId) return;
    try {
      const url = new URL('https://mvwflakurihhakdrlteg.supabase.co/functions/v1/divoom-duitku-create-invoice');
      url.searchParams.set('merchantOrderId', pending.merchantOrderId);
      url.searchParams.set('email', pending.email);
      const response = await fetch(url.toString());
      const payload = await response.json();
      if (!response.ok || !payload?.success) throw new Error();
      const status = payload.data.paymentStatus;
      setPaymentStatus(status);
      setMessage(status === 'paid'
        ? 'Payment confirmed by server. You can now view your order confirmation.'
        : status === 'failed' || status === 'expired'
          ? 'Payment was not completed. Your order remains available for review.'
          : 'Waiting for payment confirmation from Duitku…');
    } catch {
      setMessage('Payment is processing. We could not refresh its status just now.');
    }
  };

  return (
    <div className="space-y-6 text-center max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Duitku Secure Payment</h1>
      <p className="text-sm text-neutral-300">{message}</p>
      {paymentStatus && <p className="text-xs text-neutral-400">Server payment status: {paymentStatus}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={openPaymentPopup} disabled={!popupReady || paymentStatus === 'paid'} className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-lg">
          Open Payment Window
        </button>
        {paymentStatus === 'paid' && <button onClick={() => navigate('order-success', routeParam)} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold text-sm px-6 py-3 rounded-lg">
          View Order Confirmation
        </button>}
      </div>
      <p className="text-xs text-neutral-500">Payment is confirmed only after the verified server callback updates your order.</p>
    </div>
  );
}

// --- 16. PAYMENT RETURN PAGE (STANDALONE) ---
function PaymentReturnPage() {
  const [status, setStatus] = useState('Checking payment status with the server…');
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const merchantOrderId = params.get('merchantOrderId') || '';
    const stored = localStorage.getItem('divoom_pending_payment');
    const pending = stored ? JSON.parse(stored) : null;
    if (!merchantOrderId || !pending?.email || pending.merchantOrderId !== merchantOrderId) {
      setStatus('Order reference is unavailable. Please use Order Lookup or contact support.');
      return;
    }
    const check = async () => {
      try {
        const url = new URL('https://mvwflakurihhakdrlteg.supabase.co/functions/v1/divoom-duitku-create-invoice');
        url.searchParams.set('merchantOrderId', merchantOrderId);
        url.searchParams.set('email', pending.email);
        const response = await fetch(url.toString());
        const payload = await response.json();
        if (!response.ok || !payload?.success) throw new Error();
        if (!cancelled) setStatus(`Server-confirmed payment status: ${payload.data.paymentStatus}`);
      } catch {
        if (!cancelled) setStatus('Payment status is not available yet. Please refresh in a moment.');
      }
    };
    void check();
    return () => { cancelled = true; };
  }, []);
  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-bold text-white">Payment Status</h1>
      <p className="text-sm text-neutral-300">{status}</p>
      <p className="text-xs text-neutral-500">The browser redirect is not proof of payment. The server callback is authoritative.</p>
      <button onClick={() => window.location.assign('/')} className="bg-pink-600 text-white font-semibold text-xs px-6 py-2.5 rounded-lg">
        Return to Store
      </button>
    </div>
  );
}

// --- 17. ORDER SUCCESS PAGE (STANDALONE) ---
function OrderSuccessPage() {
  const { navigate } = useApp();

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Order Payment Confirmed</h1>
      <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
        Your payment status was confirmed by the verified Duitku server callback.
      </p>

      <button
        onClick={() => navigate('home')}
        className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs px-6 py-3 rounded-xl border border-neutral-700"
      >
        Back to Home Storefront
      </button>
    </div>
  );
}

// --- 18. NOT FOUND PAGE (404) ---
function NotFoundPage() {
  const { navigate } = useApp();

  return (
    <div className="py-16 text-center space-y-4">
      <h1 className="text-6xl font-black text-pink-500">404</h1>
      <h2 className="text-xl font-bold text-white">Page Not Found</h2>
      <p className="text-xs text-neutral-400">The page route you requested does not exist in this application.</p>
      <button
        onClick={() => navigate('home')}
        className="mt-4 bg-pink-600 text-white font-semibold text-xs px-6 py-2.5 rounded-lg"
      >
        Return to Home
      </button>
    </div>
  );
}

// ==========================================
// 8. REUSABLE UI COMPONENTS & OVERLAYS
// ==========================================

function ProductCard({ group }: { group: ProductGroup }) {
  const { navigate, toggleWishlist, isInWishlist } = useApp();
  const rep = group.representativeRecord;
  const isMultiPrice = group.minPrice !== group.maxPrice;
  const isWishlisted = isInWishlist(rep.id);

  return (
    <div className="bg-neutral-800/60 border border-neutral-700/80 hover:border-pink-500/80 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5">
      {/* Product Card Media */}
      <div className="aspect-square bg-neutral-900 relative overflow-hidden">
        {rep.image_link ? (
          <img
            src={rep.image_link}
            alt={group.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <PlaceholderImage text={group.title} />
        )}

        {/* Wishlist Button Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(rep.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            isWishlisted ? 'bg-pink-600 text-white' : 'bg-neutral-900/60 text-neutral-300 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {group.product_type && (
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block mb-1">
              {group.product_type}
            </span>
          )}
          <h3
            onClick={() => navigate('product-detail', group.item_group_id)}
            className="text-sm font-bold text-white hover:text-pink-400 cursor-pointer line-clamp-2 transition-colors"
          >
            {group.title}
          </h3>
        </div>

        <div className="pt-2 border-t border-neutral-700/50 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block text-[10px]">Price</span>
            <span className="text-sm font-extrabold text-white">
              {isMultiPrice ? `${formatIDR(group.minPrice)} - ${formatIDR(group.maxPrice)}` : formatIDR(group.minPrice)}
            </span>
          </div>

          <button
            onClick={() => navigate('product-detail', group.item_group_id)}
            className="bg-neutral-700 hover:bg-pink-600 text-white p-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderImage({ text }: { text: string }) {
  return (
    <div className="w-full h-full bg-neutral-800 flex flex-col items-center justify-center p-4 text-center select-none">
      <svg className="w-10 h-10 text-neutral-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-[11px] font-medium text-neutral-500 line-clamp-1">{text}</span>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="py-12 text-center space-y-2 border border-dashed border-neutral-800 rounded-2xl">
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-xs text-neutral-400 max-w-sm mx-auto">{subtitle}</p>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-neutral-800/40 border border-neutral-800 rounded-2xl h-72"></div>
      ))}
    </div>
  );
}
