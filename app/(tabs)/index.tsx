import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProducts, useCategories, useSliders } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import BannerSlider from '@/components/BannerSlider';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import ThemeLanguageBar from '@/components/ThemeLanguageBar';

const banner1 = require('@/assets/images/banner1.png');
const banner2 = require('@/assets/images/banner2.png');
const banner3 = require('@/assets/images/banner3.png');

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  const { products, loading, refetch } = useProducts(selectedCategory);
  const { categories } = useCategories();
  const { sliders } = useSliders();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 60;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.brand}>Electro Bazar</Text>
            <Text style={styles.greeting}>
              {user?.name ? `${t.welcome.split(' ')[0]}, ${user.name.split(' ')[0]}` : t.welcome}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <ThemeLanguageBar />
            <TouchableOpacity onPress={() => router.push('/cart' as any)} style={styles.cartBtn}>
              <Feather name="shopping-cart" size={22} color="#fff" />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchWrapper}>
          <SearchBar />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.section}>
          <BannerSlider sliders={sliders} bannerImages={{ banner1, banner2, banner3 }} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.categories2}</Text>
        </View>
        <CategoryChips categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {selectedCategory
              ? categories.find(c => c.id === selectedCategory)?.name ?? t.allProducts
              : t.allProducts}
          </Text>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {products.length} {t.items}
          </Text>
        </View>

        {loading ? (
          <View style={styles.grid}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={[styles.skeleton, { backgroundColor: colors.muted }]} />
            ))}
          </View>
        ) : products.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="package" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noResults}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  greeting: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  cartBtn: { position: 'relative', padding: 4 },
  cartBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#ffc107', borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#000', fontSize: 9, fontWeight: '700' },
  searchWrapper: { zIndex: 10 },
  scroll: { flex: 1 },
  content: { paddingTop: 16 },
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  count: { fontSize: 13 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 12, justifyContent: 'space-between',
  },
  skeleton: { width: '47%', height: 230, borderRadius: 12, marginBottom: 12 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16 },
});
