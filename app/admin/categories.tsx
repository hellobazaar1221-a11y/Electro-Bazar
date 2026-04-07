import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, Modal, TextInput, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';

export default function AdminCategories() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCat, setEditCat] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data ?? []);
  };

  const openAdd = () => { setEditCat(null); setName(''); setImage(''); setModalVisible(true); };
  const openEdit = (cat: any) => { setEditCat(cat); setName(cat.name); setImage(cat.image ?? ''); setModalVisible(true); };

  const save = async () => {
    if (!name) { Alert.alert('Error', 'Name is required'); return; }
    if (editCat) {
      await supabase.from('categories').update({ name, image }).eq('id', editCat.id);
    } else {
      await supabase.from('categories').insert({ name, image });
    }
    setModalVisible(false);
    loadCategories();
  };

  const deleteCat = (id: string) => {
    Alert.alert('Delete', 'Delete this category?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('categories').delete().eq('id', id);
        loadCategories();
      }},
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity onPress={openAdd}>
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.catImage} resizeMode="cover" />
            ) : (
              <View style={[styles.catImage, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
                <Feather name="grid" size={22} color={colors.mutedForeground} />
              </View>
            )}
            <Text style={[styles.catName, { color: colors.foreground }]}>{item.name}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Feather name="edit-2" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteCat(item.id)}>
                <Feather name="trash-2" size={18} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="grid" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No categories yet</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                {editCat ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetBody}>
              {[
                { label: 'Name *', value: name, setter: setName, placeholder: 'e.g. Smartphones' },
                { label: 'Image URL', value: image, setter: setImage, placeholder: 'https://...' },
              ].map(field => (
                <View key={field.label} style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
              ))}
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save}>
                  <Text style={styles.saveBtnText}>{editCat ? 'Update' : 'Add'}</Text>
                </TouchableOpacity>
              </View>
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
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  catImage: { width: 52, height: 52, borderRadius: 10 },
  catName: { flex: 1, fontSize: 15, fontWeight: '600' },
  actions: { gap: 14 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700' },
  sheetBody: { padding: 16, gap: 12 },
  field: { gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '500' },
  fieldInput: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, fontSize: 15 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  cancelText: { fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
