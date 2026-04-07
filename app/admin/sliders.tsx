import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, Modal, TextInput, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';

export default function AdminSliders() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sliders, setSliders] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [productId, setProductId] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => { loadSliders(); }, []);

  const loadSliders = async () => {
    const { data } = await supabase.from('sliders').select('*').order('created_at', { ascending: false });
    setSliders(data ?? []);
  };

  const save = async () => {
    if (!image) { Alert.alert('Error', 'Image URL is required'); return; }
    await supabase.from('sliders').insert({ image, title, product_id: productId || null, active: true });
    setModalVisible(false);
    setImage(''); setTitle(''); setProductId('');
    loadSliders();
  };

  const toggleActive = async (slider: any) => {
    await supabase.from('sliders').update({ active: !slider.active }).eq('id', slider.id);
    loadSliders();
  };

  const deleteSlider = (id: string) => {
    Alert.alert('Delete', 'Delete this slider?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('sliders').delete().eq('id', id);
        loadSliders();
      }},
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sliders / Banners</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sliders}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: item.image }} style={styles.sliderImage} resizeMode="cover" />
            <View style={styles.sliderInfo}>
              <Text style={[styles.sliderTitle, { color: colors.foreground }]} numberOfLines={1}>
                {item.title || 'No title'}
              </Text>
              <View style={[styles.activeBadge, { backgroundColor: item.active ? '#22c55e20' : '#ef444420' }]}>
                <Text style={{ color: item.active ? '#22c55e' : '#ef4444', fontSize: 11, fontWeight: '700' }}>
                  {item.active ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => toggleActive(item)}>
                <Feather name={item.active ? 'eye-off' : 'eye'} size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteSlider(item.id)}>
                <Feather name="trash-2" size={18} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="image" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No sliders yet</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Add Slider</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetBody}>
              {[
                { label: 'Image URL *', value: image, setter: setImage, placeholder: 'https://...' },
                { label: 'Title', value: title, setter: setTitle, placeholder: 'Banner title' },
                { label: 'Product ID (optional)', value: productId, setter: setProductId, placeholder: 'Link to product' },
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
                  <Text style={styles.saveBtnText}>Add Slider</Text>
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
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  sliderImage: { width: 80, height: 50, borderRadius: 8 },
  sliderInfo: { flex: 1, gap: 6 },
  sliderTitle: { fontSize: 14, fontWeight: '600' },
  activeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
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
