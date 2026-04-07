import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'electrobazar_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, [session]);

  const loadCart = async () => {
    setLoading(true);
    try {
      if (session?.user) {
        const { data } = await supabase
          .from('cart')
          .select('*, product:products(*, category:categories(*))')
          .eq('user_id', session.user.id);
        if (data) {
          setItems(data.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product: {
              ...item.product,
              images: item.product?.images || [],
            },
            quantity: item.quantity,
            user_id: item.user_id,
          })));
          return;
        }
      }
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch (_e) {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  };

  const saveLocalCart = async (newItems: CartItem[]) => {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    const existing = items.find(i => i.product_id === product.id);
    let newItems: CartItem[];

    if (existing) {
      newItems = items.map(i =>
        i.product_id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      const newItem: CartItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        product_id: product.id,
        product,
        quantity,
        user_id: session?.user?.id ?? 'guest',
      };
      newItems = [...items, newItem];
    }

    setItems(newItems);
    await saveLocalCart(newItems);

    if (session?.user) {
      if (existing) {
        await supabase.from('cart')
          .update({ quantity: existing.quantity + quantity })
          .eq('user_id', session.user.id)
          .eq('product_id', product.id);
      } else {
        await supabase.from('cart').insert({
          user_id: session.user.id,
          product_id: product.id,
          quantity,
        });
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    const newItems = items.filter(i => i.product_id !== productId);
    setItems(newItems);
    await saveLocalCart(newItems);
    if (session?.user) {
      await supabase.from('cart')
        .delete()
        .eq('user_id', session.user.id)
        .eq('product_id', productId);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const newItems = items.map(i =>
      i.product_id === productId ? { ...i, quantity } : i
    );
    setItems(newItems);
    await saveLocalCart(newItems);
    if (session?.user) {
      await supabase.from('cart')
        .update({ quantity })
        .eq('user_id', session.user.id)
        .eq('product_id', productId);
    }
  };

  const clearCart = async () => {
    setItems([]);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
    if (session?.user) {
      await supabase.from('cart').delete().eq('user_id', session.user.id);
    }
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => {
    const price = i.product.discount
      ? i.product.price * (1 - i.product.discount / 100)
      : i.product.price;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
