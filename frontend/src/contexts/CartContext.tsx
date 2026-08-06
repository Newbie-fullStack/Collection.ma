import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Listing } from '@/types';

export interface CartItem {
  listing: Listing;
  quantity: 1;
}

interface CartContextType {
  items: CartItem[];
  addItem: (listing: Listing) => void;
  removeItem: (listingId: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'collection_ma_cart';

function loadCart(): CartItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((listing: Listing) => {
    setItems(prev => {
      if (prev.some(item => item.listing.id === listing.id)) return prev;
      return [...prev, { listing, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((listingId: number) => {
    setItems(prev => prev.filter(item => item.listing.id !== listingId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, item) => {
    const price = parseFloat(String(item.listing.prix_actuel || item.listing.prix_vente)) || 0;
    const port = parseFloat(String(item.listing.frais_port)) || 0;
    return sum + price + port;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
