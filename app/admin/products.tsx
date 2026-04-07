import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert,
  TextInput, ScrollView, Modal, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';

const PLACEHOLDER = 'https://via.placeholder.com/200';

export default function AdminProducts() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditProduct(null);
    setName(''); setPrice(''); setDiscount(''); setStock('');
    setCategory(''); setDescription(''); setImageUrl(''); setFeatured(false);
    setModalVisible(true);
  };

  const openEdit = (product: any) => {
    setEditProduct(product);
    setName(product.name ?? '');
    setPrice(String(product.price ?? ''));
    setDiscount(String(product.discount ?? ''));
    setStock(String(product.stock ?? ''));
    setCategory(product.category_id ?? '');
    setDescription(product.description ?? '');
    setImageUrl(product.images?.[0] ?? '');
    setFeatured(product.featured ?? false);
    setModalVisible(true);
  };

  const saveProduct = async () => {
    if (!name || !price) { Alert.alert('Error', 'Name and price are required'); return; }
    const payload = {
      name, price: parseFloat(price), discount: parseFloat(discount) || 0,
      stock: parseInt(stock) || 0, category_id: category, description,
      images: imageUrl ? [imageUrl] : [], featured,
    };
    if (editProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id);
      if (error) Alert.alert('Error', error.message);
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) Alert.alert('Error', error.message);
    }
    setModalVisible(false);
    loadProducts();
  };

  const deleteProduct = (id: string) => {
    Alert.alert('Delete', 'Delete this product?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('products').delete().eq('id', id);
        loadProducts();
      }},
    ]);
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity onPress={openAdd}>
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}
        renderItem={({ item }) => (
          <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image
              source={{ uri: item.images?.[0] ?? PLACEHOLDER }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.productPrice, { color: colors.primary }]}>₹{item.price?.toLocaleString('en-IN')}</Text>
              <View style={styles.productMeta}>
                {item.discount > 0 && (
                  <View style={[styles.badge, { backgroundColor: '#22c55e20' }]}>
                    <Text style={{ color: '#22c55e', fontSize: 11 }}>{item.discount}% OFF</Text>
                  </View>
                )}
                <View style={[styles.badge, { backgroundColor: item.stock > 0 ? '#3b82f620' : '#ef444420' }]}>
                  <Text style={{ color: item.stock > 0 ? '#3b82f6' : '#ef4444', fontSize: 11 }}>
                    Stock: {item.stock}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Feather name="edit-2" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteProduct(item.id)}>
                <Feather name="trash-2" size={18} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="package" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No products yet</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {editProduct ? 'Edit Product' : 'Add Product'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {[
                { label: 'Product Name *', value: name, setter: setName, placeholder: 'e.g. iPhone 15' },
                { label: 'Price (₹) *', value: price, setter: setPrice, placeholder: '0', keyboard: 'number-pad' as const },
                { label: 'Discount (%)', value: discount, setter: setDiscount, placeholder: '0', keyboard: 'number-pad' as const },
                { label: 'Stock Quantity', value: stock, setter: setStock, placeholder: '0', keyboard: 'number-pad' as const },
                { label: 'Category ID', value: category, setter: setCategory, placeholder: 'Category ID or name' },
                { label: 'Image URL', value: imageUrl, setter: setImageUrl, placeholder: 'https://...' },
                { label: 'Description', value: description, setter: setDescription, placeholder: 'Product description', multiline: true },
              ].map(field => (
                <View key={field.label} style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border },
                      field.multiline && { height: 80, textAlignVertical: 'top' },
                    ]}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType={field.keyboard}
                    multiline={field.multiline}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={[styles.toggleRow, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => setFeatured(!featured)}
              >
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Featured Product</Text>
                <View style={[styles.toggleBtn, { backgroundColor: featured ? colors.primary : colors.border }]}>
                  <View style={[styles.toggleDot, { transform: [{ translateX: featured ? 14 : 0 }] }]} />
                </View>
              </TouchableOpacity>
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={saveProduct}
              >
                <Text style={styles.saveBtnText}>{editProduct ? 'Update' : 'Add Product'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  list: { paddingHorizontal: 16, gap: 12 },
  productCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  productImage: { width: 60, height: 60, borderRadius: 8 },
  productInfo: { flex: 1, gap: 4 },
  productName: { fontSize: 14, fontWeight: '600' },
  productPrice: { fontSize: 15, fontWeight: '700' },
  productMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  actions: { gap: 14, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalScroll: { padding: 16, maxHeight: 500 },
  modalFooter: {
    flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1,
  },
  field: { gap: 4, marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '500' },
  fieldInput: {
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 8, borderWidth: 1, fontSize: 15,
  },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 12,
  },
  toggleLabel: { fontSize: 14, fontWeight: '500' },
  toggleBtn: { width: 36, height: 22, borderRadius: 11, justifyContent: 'center', paddingHorizontal: 3 },
  toggleDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  cancelText: { fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
