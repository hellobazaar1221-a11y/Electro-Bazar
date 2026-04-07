import React from 'react';
import {
  View, Text, StyleSheet, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FlatList, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products, loading } = useProducts(undefined, q);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Results for "{q}"</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Feather name="search" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.foreground }]}>
                No results found for "{q}"
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <ProductCard product={item} />}
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
  navTitle: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, paddingHorizontal: 12 },
  content: { padding: 12 },
  row: { gap: 12, justifyContent: 'space-between' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
