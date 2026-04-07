import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useOrders } from '@/hooks/useProducts';
import { useAuth } from '@/context/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const STATUS_ICONS: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  pending: 'clock',
  confirmed: 'check-circle',
  shipped: 'truck',
  delivered: 'package',
  cancelled: 'x-circle',
};

const STAGES = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { orders, loading } = useOrders();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!session) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="lock" size={48} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in to view orders</Text>
        <TouchableOpacity
          style={[styles.signInBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/auth' as any)}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Orders</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Feather name="package" size={56} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Your orders will appear here
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status] ?? colors.primary;
          const statusIcon = STATUS_ICONS[item.status] ?? 'package';
          const stageIdx = STAGES.indexOf(item.status);

          return (
            <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.orderHeader}>
                <Text style={[styles.orderId, { color: colors.mutedForeground }]}>
                  Order #{item.id.slice(0, 8).toUpperCase()}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <Feather name={statusIcon} size={12} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.timeline}>
                {STAGES.map((stage, i) => (
                  <View key={stage} style={styles.timelineItem}>
                    <View style={[
                      styles.timelineDot,
                      { backgroundColor: i <= stageIdx ? colors.primary : colors.border },
                    ]} />
                    {i < STAGES.length - 1 && (
                      <View style={[styles.timelineLine, {
                        backgroundColor: i < stageIdx ? colors.primary : colors.border,
                      }]} />
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.timelineLabels}>
                {STAGES.map((stage, i) => (
                  <Text
                    key={stage}
                    style={[styles.timelineLabel, {
                      color: i <= stageIdx ? colors.primary : colors.mutedForeground,
                    }]}
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </Text>
                ))}
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.orderFooter}>
                <Text style={[styles.orderItems, { color: colors.mutedForeground }]}>
                  {(item.items as any[]).length} item{(item.items as any[]).length !== 1 ? 's' : ''}
                </Text>
                <Text style={[styles.orderTotal, { color: colors.primary }]}>
                  ₹{Math.round(item.total_price).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  navTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  orderCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 13, fontWeight: '500' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timelineItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { flex: 1, height: 2, marginHorizontal: 2 },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineLabel: { fontSize: 10, fontWeight: '500', flex: 1, textAlign: 'center' },
  divider: { height: 1 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderItems: { fontSize: 13 },
  orderTotal: { fontSize: 17, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 14 },
  signInBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  signInText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
