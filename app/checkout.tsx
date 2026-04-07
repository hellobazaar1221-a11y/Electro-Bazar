import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

type PaymentMethod = 'cod' | 'upi';

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, totalPrice, clearCart } = useCart();
  const { session, user } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const deliveryFee = totalPrice >= 499 ? 0 : 49;
  const finalTotal = Math.max(0, totalPrice - discount) + deliveryFee;

  const applyCoupon = async () => {
    if (!couponCode) return;
    const { data } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).single();
    if (!data) { Alert.alert('Invalid coupon code'); return; }
    if (data.expiry && new Date(data.expiry) < new Date()) { Alert.alert('Coupon expired'); return; }
    const disc = data.discount_type === 'percentage' ? totalPrice * data.discount / 100 : data.discount;
    setDiscount(disc);
    Alert.alert('Coupon applied!', `You saved ₹${Math.round(disc)}`);
  };

  const placeOrder = async () => {
    if (!name || !phone || !address || !city || !pincode) {
      Alert.alert('Error', 'Please fill all delivery details');
      return;
    }
    if (!session) {
      Alert.alert('Sign In Required', 'Please sign in to place an order', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth' as any) },
      ]);
      return;
    }
    setPlacing(true);
    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.discount
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price,
        image: item.product.images?.[0] ?? null,
      }));
      const { error } = await supabase.from('orders').insert({
        user_id: session.user.id,
        items: orderItems,
        total_price: finalTotal,
        status: 'pending',
        payment_method: payment,
        payment_status: payment === 'cod' ? 'pending' : 'pending',
        address: { name, phone, line1: address, city, pincode },
      });
      if (error) throw error;
      await clearCart();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/order-success' as any);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t.proceedToCheckout}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t.deliveryAddress}</Text>
          {[
            { label: t.fullName, value: name, setter: setName, placeholder: 'Enter your name' },
            { label: 'Phone', value: phone, setter: setPhone, placeholder: '+91 9xxxxxxxxx', keyboard: 'phone-pad' as const },
            { label: 'Address', value: address, setter: setAddress, placeholder: 'Street, Colony, Area' },
            { label: 'City', value: city, setter: setCity, placeholder: 'Your city' },
            { label: 'Pincode', value: pincode, setter: setPincode, placeholder: '6-digit pincode', keyboard: 'number-pad' as const },
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
              />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t.couponCode}</Text>
          <View style={styles.couponRow}>
            <TextInput
              style={[styles.couponInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter coupon code"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.couponBtn, { backgroundColor: colors.primary }]}
              onPress={applyCoupon}
            >
              <Text style={styles.couponBtnText}>{t.apply}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t.paymentMethod}</Text>
          {([
            { id: 'cod', label: t.cashOnDelivery, icon: 'dollar-sign' as const, desc: 'Pay when you receive' },
            { id: 'upi', label: t.upi, icon: 'smartphone' as const, desc: '9504912525@ybl · 9631416111@ybl' },
          ] as const).map(opt => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.paymentOption,
                { borderColor: payment === opt.id ? colors.primary : colors.border },
                payment === opt.id && { backgroundColor: colors.primary + '10' },
              ]}
              onPress={() => setPayment(opt.id)}
            >
              <View style={[styles.paymentIcon, { backgroundColor: payment === opt.id ? colors.primary : colors.muted }]}>
                <Feather name={opt.icon} size={18} color={payment === opt.id ? '#fff' : colors.mutedForeground} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.foreground }]}>{opt.label}</Text>
                <Text style={[styles.paymentDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
              </View>
              <View style={[styles.radio, { borderColor: payment === opt.id ? colors.primary : colors.border }]}>
                {payment === opt.id && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t.orderSummary}</Text>
          {items.map(item => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={[styles.summaryName, { color: colors.foreground }]} numberOfLines={1}>
                {item.product.name} × {item.quantity}
              </Text>
              <Text style={[styles.summaryPrice, { color: colors.foreground }]}>
                ₹{Math.round((item.product.discount
                  ? item.product.price * (1 - item.product.discount / 100)
                  : item.product.price) * item.quantity).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryName, { color: '#22c55e' }]}>Coupon Discount</Text>
              <Text style={[styles.summaryPrice, { color: '#22c55e' }]}>-₹{Math.round(discount)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryName, { color: colors.mutedForeground }]}>{t.deliveryFee}</Text>
            <Text style={[styles.summaryPrice, { color: colors.mutedForeground }]}>
              {deliveryFee === 0 ? t.free : `₹${deliveryFee}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>{t.total}</Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>
              ₹{Math.round(finalTotal).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
        <TouchableOpacity
          style={[styles.placeBtn, { backgroundColor: colors.primary }, placing && styles.disabled]}
          onPress={placeOrder}
          disabled={placing}
        >
          <Feather name="check-circle" size={20} color="#fff" />
          <Text style={styles.placeBtnText}>
            {placing ? 'Placing...' : `${t.placeOrder} · ₹${Math.round(finalTotal).toLocaleString('en-IN')}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navbar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14,
  },
  navTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  field: { gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '500' },
  fieldInput: {
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1, fontSize: 15,
  },
  couponRow: { flexDirection: 'row', gap: 10 },
  couponInput: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1, fontSize: 15,
  },
  couponBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, justifyContent: 'center' },
  couponBtnText: { color: '#fff', fontWeight: '600' },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1.5,
  },
  paymentIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  paymentInfo: { flex: 1, gap: 2 },
  paymentLabel: { fontSize: 14, fontWeight: '600' },
  paymentDesc: { fontSize: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryName: { fontSize: 14, flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 14, fontWeight: '500' },
  divider: { height: 1, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalPrice: { fontSize: 20, fontWeight: '800' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
  placeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 12,
  },
  disabled: { opacity: 0.6 },
  placeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
