import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';
import { Coupon } from '@/types';

export default function CouponsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const defaultCoupons: Coupon[] = [
    { id: '1', code: 'WELCOME10', discount: 10, discount_type: 'percentage', min_amount: 500 },
    { id: '2', code: 'SAVE100', discount: 100, discount_type: 'fixed', min_amount: 999 },
    { id: '3', code: 'TECH20', discount: 20, discount_type: 'percentage', min_amount: 2000 },
  ];

  useEffect(() => {
    supabase.from('coupons').select('*').then(({ data }) => {
      setCoupons(data?.length ? data : defaultCoupons);
      setLoading(false);
    }).catch(() => {
      setCoupons(defaultCoupons);
      setLoading(false);
    });
  }, []);

  const copyCoupon = (code: string) => {
    Clipboard.setString(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', `Coupon code "${code}" copied to clipboard`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Coupons & Offers</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={coupons}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.couponCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.couponLeft, { backgroundColor: colors.primary }]}>
              <Feather name="tag" size={24} color="#ffc107" />
              <Text style={styles.discount}>
                {item.discount_type === 'percentage' ? `${item.discount}%` : `₹${item.discount}`}
              </Text>
              <Text style={styles.discountLabel}>OFF</Text>
            </View>
            <View style={styles.couponRight}>
              <Text style={[styles.code, { color: colors.foreground }]}>{item.code}</Text>
              {item.min_amount ? (
                <Text style={[styles.minAmount, { color: colors.mutedForeground }]}>
                  Min. purchase: ₹{item.min_amount.toLocaleString('en-IN')}
                </Text>
              ) : null}
              {item.expiry ? (
                <Text style={[styles.expiry, { color: colors.mutedForeground }]}>
                  Expires: {new Date(item.expiry).toLocaleDateString('en-IN')}
                </Text>
              ) : (
                <Text style={[styles.expiry, { color: '#22c55e' }]}>No expiry</Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.copyBtn, { borderColor: colors.primary }]}
              onPress={() => copyCoupon(item.code)}
            >
              <Text style={[styles.copyText, { color: colors.primary }]}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}
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
  navTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  couponCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  couponLeft: {
    width: 80,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 4,
  },
  discount: { color: '#fff', fontSize: 22, fontWeight: '800' },
  discountLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  couponRight: { flex: 1, padding: 16, gap: 4 },
  code: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  minAmount: { fontSize: 12 },
  expiry: { fontSize: 12 },
  copyBtn: {
    marginRight: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  copyText: { fontWeight: '700', fontSize: 13 },
});
