import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useCategories, useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

const iconMap: Record<string, FeatherIconName> = {
  Mobiles: 'smartphone',
  Audio: 'headphones',
  Tablets: 'tablet',
  Laptops: 'monitor',
  Cameras: 'camera',
  TVs: 'tv',
  Wearables: 'watch',
  Gaming: 'cpu',
};

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories } = useCategories();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const { products, loading } = useProducts(selected);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 60;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <View style={styles.body}>
        <View style={[styles.sidebar, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
          <FlatList
            data={categories}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => {
              const isSelected = item.id === selected;
              const iconName: FeatherIconName = iconMap[item.name] || 'box';
              return (
                <TouchableOpacity
                  style={[
                    styles.sidebarItem,
                    isSelected && { backgroundColor: colors.primary + '15', borderRightColor: colors.primary },
                  ]}
                  onPress={() => setSelected(item.id)}
                >
                  <Feather
                    name={iconName}
                    size={18}
                    color={isSelected ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.sidebarLabel,
                      { color: isSelected ? colors.primary : colors.foreground },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <FlatList
          data={products}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={[styles.products, { paddingBottom: bottomPad }]}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                {[1, 2, 3, 4].map(i => (
                  <View key={i} style={[styles.skeleton, { backgroundColor: colors.muted }]} />
                ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Feather name="package" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  {selected ? 'No products in this category' : 'Select a category'}
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 90,
    borderRightWidth: 1,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 6,
    borderRightWidth: 3,
    borderRightColor: 'transparent',
  },
  sidebarLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  products: {
    padding: 8,
    flex: 1,
  },
  row: {
    gap: 8,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
  },
  skeleton: {
    width: '47%',
    height: 220,
    borderRadius: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
