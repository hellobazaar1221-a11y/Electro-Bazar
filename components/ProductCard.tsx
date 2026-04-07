import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const colors = useColors();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = async () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addToCart(product);
  };

  const handleWishlist = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleWishlist(product);
  };

  const inWishlist = isInWishlist(product.id);
  const imageUri = product.images?.[0];

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }, animatedStyle]}>
      <TouchableOpacity onPress={() => router.push(`/product/${product.id}` as any)} activeOpacity={0.9}>
        <View style={[styles.imageContainer, { backgroundColor: colors.muted }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.placeholder}>
              <Feather name="package" size={36} color={colors.mutedForeground} />
            </View>
          )}
          {product.discount ? (
            <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
              <Text style={styles.badgeText}>{product.discount}% OFF</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={[styles.wishlistBtn, { backgroundColor: colors.card }]}
            onPress={handleWishlist}
          >
            <Feather
              name="heart"
              size={16}
              color={inWishlist ? '#ef4444' : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
            {product.name}
          </Text>

          {product.rating ? (
            <View style={styles.rating}>
              <Feather name="star" size={11} color="#fbbf24" />
              <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                {product.rating} ({product.reviews_count})
              </Text>
            </View>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              ₹{Math.round(discountedPrice).toLocaleString('en-IN')}
            </Text>
            {product.discount ? (
              <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                ₹{product.price.toLocaleString('en-IN')}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
        onPress={handleAddToCart}
        activeOpacity={0.8}
      >
        <Feather name="shopping-cart" size={14} color="#fff" />
        <Text style={styles.addBtnText}>Add</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    padding: 10,
    gap: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
