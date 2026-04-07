import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, WishlistItem } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface WishlistContextType {
  items: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);
const WISHLIST_KEY = 'electrobazar_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, [session]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      if (session?.user) {
        const { data } = await supabase
          .from('wishlist')
          .select('*, product:products(*, category:categories(*))')
          .eq('user_id', session.user.id);
        if (data) {
          setItems(data.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product: { ...item.product, images: item.product?.images || [] },
            user_id: item.user_id,
          })));
          return;
        }
      }
      const stored = await AsyncStorage.getItem(WISHLIST_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch (_e) {
      const stored = await AsyncStorage.getItem(WISHLIST_KEY);
      if (stored) setItems(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string) =>
    items.some(i => i.product_id === productId);

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      const newItems = items.filter(i => i.product_id !== product.id);
      setItems(newItems);
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(newItems));
      if (session?.user) {
        await supabase.from('wishlist')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', product.id);
      }
    } else {
      const newItem: WishlistItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        product_id: product.id,
        product,
        user_id: session?.user?.id ?? 'guest',
      };
      const newItems = [...items, newItem];
      setItems(newItems);
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(newItems));
      if (session?.user) {
        await supabase.from('wishlist').insert({
          user_id: session.user.id,
          product_id: product.id,
        });
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ items, isInWishlist, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
