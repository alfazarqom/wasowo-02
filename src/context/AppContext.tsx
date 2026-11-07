import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { DivoomProduct, ProductGroup, CartItem } from '../types';
import { REAL_AUDIT_SEED_DATA } from '../data/seedData';

interface AppContextType {
  products: DivoomProduct[];
  productGroups: ProductGroup[];
  loading: boolean;
  error: string | null;
  usingFallbackData: boolean;
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: DivoomProduct, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedProductVariant: DivoomProduct | null;
  setSelectedProductVariant: (product: DivoomProduct | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<DivoomProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState<boolean>(false);

  // Cart & Wishlist with localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('divoom_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('divoom_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProductVariant, setSelectedProductVariant] = useState<DivoomProduct | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('divoom_cart', JSON.stringify(cart));
    } catch {
      // Storage unavailable
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('divoom_wishlist', JSON.stringify(wishlist));
    } catch {
      // Storage unavailable
    }
  }, [wishlist]);

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
      } catch (err: unknown) {
        console.warn("Live API connection unreachable/failed. Reverting to audited schema dataset.", err);
        if (isMounted) {
          setProducts(REAL_AUDIT_SEED_DATA);
          setUsingFallbackData(true);
          setError(null);
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
      toastMessage,
      showToast,
      searchTerm,
      setSearchTerm,
      selectedProductVariant,
      setSelectedProductVariant
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
