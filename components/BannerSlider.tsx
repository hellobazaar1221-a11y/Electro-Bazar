import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Animated,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Slider } from '@/types';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 160;

interface Props {
  sliders: Slider[];
  bannerImages?: { [key: string]: any };
}

export default function BannerSlider({ sliders, bannerImages = {} }: Props) {
  const colors = useColors();
  const [current, setCurrent] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const bannerColors = ['#1a3ec8', '#c8691a', '#1ac876'];
  const bannerTitles = sliders.length > 0
    ? sliders.map(s => s.title || 'Special Offer')
    : ['Mega Sale — Up to 70% Off', 'New Arrivals Daily', 'Free Delivery over ₹499'];

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      const next = (current + 1) % sliders.length;
      setCurrent(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [current, sliders.length]);

  if (sliders.length === 0) {
    const mockSliders = [
      { id: '1', title: 'Mega Sale — Up to 70% Off', active: true, image: '' },
      { id: '2', title: 'Top Electronics Brands', active: true, image: '' },
      { id: '3', title: 'Free Delivery on ₹499+', active: true, image: '' },
    ];
    sliders = mockSliders;
  }

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={sliders}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrent(index);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.slide,
              { backgroundColor: bannerColors[index % bannerColors.length] },
            ]}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            ) : bannerImages[`banner${index + 1}`] ? (
              <Image source={bannerImages[`banner${index + 1}`]} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.textBanner}>
                <Text style={styles.bannerSubtitle}>ELECTRO BAZAR</Text>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <View style={styles.shopBtn}>
                  <Text style={styles.shopBtnText}>Shop Now</Text>
                </View>
              </View>
            )}
          </View>
        )}
      />

      <View style={styles.dots}>
        {sliders.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === current ? colors.primary : colors.border },
              i === current && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: width - 32,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textBanner: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 8,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  shopBtn: {
    marginTop: 4,
    backgroundColor: '#ffc107',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  shopBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
  },
});
