import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, Modal, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';

const STATUSES = ['pending', 'confirmed', 'shipped', 'arriving', 'delivered'];
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6',
  arriving: '#06b6d4', delivered: '#22c55e',
};

export default function AdminOrders() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) Alert.alert('Error', error.message);
    else { loadOrders(); setSelected((s: any) => s ? { ...s, status } : s); }
  };

  const updatePayment = async (id: string, payment_status: string) => {
    const { error } = await supabase.from('orders').update({ payment_status }).eq('id', id);
    if (error) Alert.alert('Error', error.message);
    else loadOrders();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders ({orders.length})</Text>
        <TouchableOpacity onPress={loadOrders}>
          <Feather name="refresh-cw" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setSelected(item)}
          >
            <View style={styles.cardRow}>
              <Text style={[styles.orderId, { color: colors.foreground }]}>
                #{item.id?.slice(-6)?.toUpperCase()}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] ?? '#888') + '20' }]}>
                <Text style={{ color: STATUS_COLORS[item.status] ?? '#888', fontSize: 11, fontWeight: '700' }}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={[styles.orderTotal, { color: colors.primary }]}>
              ₹{item.total_price?.toLocaleString('en-IN')}
            </Text>
            <View style={styles.cardRow}>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {item.payment_method?.toUpperCase()} · {item.payment_status}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN') : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shopping-bag" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No orders yet</Text>
          </View>
        }
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                Order #{selected?.id?.slice(-6)?.toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sheetScroll}>
              <Text style={[styles.sheetSection, { color: colors.mutedForeground }]}>Update Status</Text>
              <View style={styles.statusRow}>
                {STATUSES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusBtn,
                      { borderColor: STATUS_COLORS[s] },
                      selected?.status === s && { backgroundColor: STATUS_COLORS[s] },
                    ]}
                    onPress={() => updateStatus(selected?.id, s)}
                  >
                    <Text style={{ color: selected?.status === s ? '#fff' : STATUS_COLORS[s], fontSize: 11, fontWeight: '600' }}>
                      {s.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sheetSection, { color: colors.mutedForeground }]}>Payment Status</Text>
              <View style={styles.statusRow}>
                {['pending', 'approved', 'failed'].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.statusBtn,
                      { borderColor: p === 'approved' ? '#22c55e' : p === 'failed' ? '#ef4444' : '#f59e0b' },
                      selected?.payment_status === p && {
                        backgroundColor: p === 'approved' ? '#22c55e' : p === 'failed' ? '#ef4444' : '#f59e0b',
                      },
                    ]}
                    onPress={() => updatePayment(selected?.id, p)}
                  >
                    <Text style={{
                      color: selected?.payment_status === p ? '#fff' :
                        p === 'approved' ? '#22c55e' : p === 'failed' ? '#ef4444' : '#f59e0b',
                      fontSize: 11, fontWeight: '600',
                    }}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selected?.address && (
                <>
                  <Text style={[styles.sheetSection, { color: colors.mutedForeground }]}>Delivery Address</Text>
                  <Text style={[styles.addrText, { color: colors.foreground }]}>
                    {selected.address.name}{'\n'}{selected.address.phone}{'\n'}
                    {selected.address.line1}, {selected.address.city} - {selected.address.pincode}
                  </Text>
                </>
              )}

              {selected?.items && (
                <>
                  <Text style={[styles.sheetSection, { color: colors.mutedForeground }]}>Items</Text>
                  {selected.items.map((item: any, i: number) => (
                    <View key={i} style={styles.itemRow}>
                      <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>
                        {item.product_name}
                      </Text>
                      <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>
                        x{item.quantity} · ₹{item.price?.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
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
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  orderTotal: { fontSize: 18, fontWeight: '800' },
  meta: { fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700' },
  sheetScroll: { padding: 16, maxHeight: 500 },
  sheetSection: { fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: 12, textTransform: 'uppercase' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
  addrText: { fontSize: 14, lineHeight: 22, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemName: { fontSize: 13, flex: 1 },
  itemMeta: { fontSize: 13 },
});
