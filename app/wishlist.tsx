import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function WishlistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Wishlist ({items.length})</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="heart" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Wishlist is empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Save products you love here
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const discountedPrice = item.product.discount
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price;
          const imageUri = item.product.images?.[0];

          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => router.push(`/product/${item.product_id}` as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.imageBox, { backgroundColor: colors.muted }]}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
                  ) : (
                    <Feather name="package" size={30} color={colors.mutedForeground} />
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={[styles.price, { color: colors.primary }]}>
                    ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.cartBtn, { backgroundColor: colors.primary }]}
                  onPress={() => addToCart(item.product)}
                >
                  <Feather name="shopping-cart" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.removeBtn, { borderColor: colors.border }]}
                  onPress={() => toggleWishlist(item.product)}
                >
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  navTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  imageBox: {
    width: 72,
    height: 72,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 72, height: 72, borderRadius: 8 },
  info: { flex: 1, gap: 6, justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  price: { fontSize: 16, fontWeight: '700' },
  actions: { flexDirection: 'column', gap: 0 },
  cartBtn: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
  },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 14 },
});
