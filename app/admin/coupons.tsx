import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, Modal, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';

export default function AdminCoupons() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [expiry, setExpiry] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data ?? []);
  };

  const save = async () => {
    if (!code || !discount) { Alert.alert('Error', 'Code and discount are required'); return; }
    const { error } = await supabase.from('coupons').insert({
      code: code.toUpperCase(), discount: parseFloat(discount),
      discount_type: discountType, expiry: expiry || null,
      min_amount: parseFloat(minAmount) || 0,
    });
    if (error) Alert.alert('Error', error.message);
    else { setModalVisible(false); setCode(''); setDiscount(''); setExpiry(''); setMinAmount(''); loadCoupons(); }
  };

  const deleteCoupon = (id: string) => {
    Alert.alert('Delete', 'Delete this coupon?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('coupons').delete().eq('id', id);
        loadCoupons();
      }},
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupons</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={coupons}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.couponLeft, { backgroundColor: colors.primary + '15' }]}>
              <Feather name="tag" size={24} color={colors.primary} />
            </View>
            <View style={styles.couponInfo}>
              <Text style={[styles.couponCode, { color: colors.foreground }]}>{item.code}</Text>
              <Text style={[styles.couponDiscount, { color: colors.primary }]}>
                {item.discount_type === 'percentage' ? `${item.discount}% OFF` : `₹${item.discount} OFF`}
              </Text>
              {item.min_amount > 0 && (
                <Text style={[styles.couponMeta, { color: colors.mutedForeground }]}>
                  Min: ₹{item.min_amount}
                </Text>
              )}
              {item.expiry && (
                <Text style={[styles.couponMeta, { color: colors.mutedForeground }]}>
                  Exp: {new Date(item.expiry).toLocaleDateString('en-IN')}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => deleteCoupon(item.id)}>
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="tag" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No coupons yet</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Create Coupon</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetBody}>
              {[
                { label: 'Coupon Code *', value: code, setter: setCode, placeholder: 'e.g. SAVE20', auto: 'characters' as const },
                { label: 'Discount Value *', value: discount, setter: setDiscount, placeholder: '20', keyboard: 'number-pad' as const },
                { label: 'Min Order Amount', value: minAmount, setter: setMinAmount, placeholder: '499', keyboard: 'number-pad' as const },
                { label: 'Expiry Date (YYYY-MM-DD)', value: expiry, setter: setExpiry, placeholder: '2025-12-31' },
              ].map(field => (
                <View key={field.label} style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType={field.keyboard}
                    autoCapitalize={field.auto}
                  />
                </View>
              ))}
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Discount Type</Text>
                <View style={styles.typeRow}>
                  {(['percentage', 'fixed'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeBtn,
                        { borderColor: discountType === type ? colors.primary : colors.border },
                        discountType === type && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setDiscountType(type)}
                    >
                      <Text style={{ color: discountType === type ? '#fff' : colors.foreground, fontWeight: '600' }}>
                        {type === 'percentage' ? '% Off' : '₹ Off'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={save}>
                  <Text style={styles.saveBtnText}>Create Coupon</Text>
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
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  couponLeft: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  couponInfo: { flex: 1, gap: 2 },
  couponCode: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  couponDiscount: { fontSize: 14, fontWeight: '600' },
  couponMeta: { fontSize: 12 },
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
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  cancelText: { fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
