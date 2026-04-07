import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { product, loading } = useProduct(id);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [currentImage, setCurrentImage] = useState(0);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.skeleton, { backgroundColor: colors.muted, height: 300 }]} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Product not found</Text>
      </View>
    );
  }

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addToCart(product);
  };

  const handleBuyNow = async () => {
    await addToCart(product);
    router.push('/checkout' as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground }]} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity onPress={() => toggleWishlist(product)}>
          <Feather
            name="heart"
            size={22}
            color={inWishlist ? '#ef4444' : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
      >
        <View style={[styles.imageSection, { backgroundColor: colors.muted }]}>
          {product.images.length > 0 ? (
            <>
              <Image
                source={{ uri: product.images[currentImage] }}
                style={styles.mainImage}
                resizeMode="contain"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnails}>
                {product.images.map((uri, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setCurrentImage(idx)}
                    style={[
                      styles.thumb,
                      { borderColor: idx === currentImage ? colors.primary : colors.border },
                    ]}
                  >
                    <Image source={{ uri }} style={styles.thumbImage} resizeMode="contain" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <View style={styles.noImage}>
              <Feather name="package" size={60} color={colors.mutedForeground} />
            </View>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.productName, { color: colors.foreground }]}>{product.name}</Text>

          {product.rating ? (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <Feather
                  key={star}
                  name="star"
                  size={14}
                  color={star <= Math.round(product.rating!) ? '#fbbf24' : colors.border}
                />
              ))}
              <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                {product.rating} · {product.reviews_count} reviews
              </Text>
            </View>
          ) : null}

          <View style={styles.priceSection}>
            <Text style={[styles.price, { color: colors.primary }]}>
              ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
            </Text>
            {product.discount ? (
              <View style={styles.discountRow}>
                <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                  ₹{product.price.toLocaleString('en-IN')}
                </Text>
                <View style={[styles.discountBadge, { backgroundColor: colors.destructive }]}>
                  <Text style={styles.discountText}>{product.discount}% OFF</Text>
                </View>
              </View>
            ) : null}
          </View>

          <View style={[styles.stockRow, { backgroundColor: colors.muted }]}>
            <Feather
              name={product.stock > 0 ? 'check-circle' : 'x-circle'}
              size={14}
              color={product.stock > 0 ? '#22c55e' : colors.destructive}
            />
            <Text style={[styles.stockText, { color: product.stock > 0 ? '#22c55e' : colors.destructive }]}>
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
            </Text>
          </View>

          {product.description ? (
            <View style={styles.descSection}>
              <Text style={[styles.descTitle, { color: colors.foreground }]}>Description</Text>
              <Text style={[styles.desc, { color: colors.mutedForeground }]}>{product.description}</Text>
            </View>
          ) : null}

          <View style={[styles.deliveryRow, { backgroundColor: colors.muted }]}>
            <Feather name="truck" size={16} color={colors.primary} />
            <Text style={[styles.deliveryText, { color: colors.foreground }]}>
              Free delivery on orders above ₹499
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: bottomPad + 8,
      }]}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
          activeOpacity={0.8}
        >
          <Feather name="shopping-cart" size={18} color={colors.primary} />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyBtn, { backgroundColor: colors.primary }]}
          onPress={handleBuyNow}
          disabled={product.stock === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  navTitle: { flex: 1, fontSize: 16, fontWeight: '600', paddingHorizontal: 12 },
  content: {},
  imageSection: {
    height: 300,
    position: 'relative',
  },
  mainImage: { width: '100%', height: 240 },
  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnails: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  infoCard: {
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  productName: { fontSize: 18, fontWeight: '700', lineHeight: 26 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, marginLeft: 4 },
  priceSection: { gap: 4 },
  price: { fontSize: 28, fontWeight: '800' },
  discountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  originalPrice: { fontSize: 15, textDecorationLine: 'line-through' },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stockText: { fontSize: 14, fontWeight: '500' },
  descSection: { gap: 6 },
  descTitle: { fontSize: 16, fontWeight: '600' },
  desc: { fontSize: 14, lineHeight: 22 },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  deliveryText: { fontSize: 13 },
  skeleton: { width: '100%', borderRadius: 0 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  addBtnText: { fontSize: 15, fontWeight: '700' },
  buyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
