import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/types';

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 60;

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout' as any);
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const discountedPrice = item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
    const imageUri = item.product.images?.[0];

    return (
      <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.imageBox, { backgroundColor: colors.muted }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          ) : (
            <Feather name="package" size={30} color={colors.mutedForeground} />
          )}
        </View>

        <View style={styles.details}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={[styles.price, { color: colors.primary }]}>
            ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
          </Text>
          {item.product.discount ? (
            <Text style={[styles.original, { color: colors.mutedForeground }]}>
              ₹{item.product.price.toLocaleString('en-IN')} · {item.product.discount}% off
            </Text>
          ) : null}

          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, { borderColor: colors.border }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateQuantity(item.product_id, item.quantity - 1);
              }}
            >
              <Feather name="minus" size={14} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.qty, { color: colors.foreground }]}>{item.quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { borderColor: colors.border }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateQuantity(item.product_id, item.quantity + 1);
              }}
            >
              <Feather name="plus" size={14} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => removeFromCart(item.product_id)}
          style={styles.removeBtn}
        >
          <Feather name="trash-2" size={18} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Cart ({items.length})</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shopping-cart" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Add products to start shopping
            </Text>
            <TouchableOpacity
              style={[styles.shopBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/' as any)}
            >
              <Text style={styles.shopBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={[styles.footer, {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: bottomPad + 8,
        }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total</Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>
              ₹{Math.round(totalPrice).toLocaleString('en-IN')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
            onPress={handleCheckout}
            activeOpacity={0.85}
          >
            <Feather name="credit-card" size={18} color="#fff" />
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  clearText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  list: { padding: 16, gap: 12 },
  item: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 12,
    gap: 12,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 80, height: 80, borderRadius: 8 },
  details: { flex: 1, gap: 4 },
  name: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  price: { fontSize: 16, fontWeight: '700' },
  original: { fontSize: 11, textDecorationLine: 'line-through' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  qty: { fontSize: 15, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 4, alignSelf: 'flex-start' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 14 },
  shopBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  shopBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15 },
  totalPrice: { fontSize: 22, fontWeight: '800' },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
