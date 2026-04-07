import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert,
  TextInput, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';

const ADMIN_PHONE = '8434023311';
const ADMIN_KEY = 'electrobazar_admin_session';
const logo = require('@/assets/images/icon.png');

interface Stats {
  products: number;
  orders: number;
  users: number;
  revenue: number;
}

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [authed, setAuthed] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem(ADMIN_KEY).then(val => {
      if (val === 'true') { setAuthed(true); loadStats(); }
    });
  }, []);

  const handleLogin = () => {
    if (phone === ADMIN_PHONE && password === 'admin123') {
      AsyncStorage.setItem(ADMIN_KEY, 'true');
      setAuthed(true);
      loadStats();
    } else {
      Alert.alert('Access Denied', 'Invalid admin credentials');
    }
  };

  const handleLogout = () => {
    AsyncStorage.removeItem(ADMIN_KEY);
    setAuthed(false);
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const [{ count: pc }, { count: oc }, { count: uc }, { data: orders }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_price, user_id, status, created_at, items').order('created_at', { ascending: false }).limit(5),
      ]);
      const revenue = orders?.reduce((s: number, o: any) => s + (o.total_price ?? 0), 0) ?? 0;
      setStats({ products: pc ?? 0, orders: oc ?? 0, users: uc ?? 0, revenue });
      setRecentOrders(orders ?? []);
    } catch (e) {}
    setLoading(false);
  };

  const navItems = [
    { label: 'Products', icon: 'package' as const, route: '/admin/products', color: '#3b82f6' },
    { label: 'Orders', icon: 'shopping-bag' as const, route: '/admin/orders', color: '#22c55e' },
    { label: 'Users', icon: 'users' as const, route: '/admin/users', color: '#f59e0b' },
    { label: 'Categories', icon: 'grid' as const, route: '/admin/categories', color: '#8b5cf6' },
    { label: 'Coupons', icon: 'tag' as const, route: '/admin/coupons', color: '#ec4899' },
    { label: 'Notifications', icon: 'bell' as const, route: '/admin/notifications', color: '#ef4444' },
    { label: 'Sliders', icon: 'image' as const, route: '/admin/sliders', color: '#06b6d4' },
  ];

  if (!authed) {
    return (
      <View style={[styles.loginRoot, { backgroundColor: colors.background }]}>
        <View style={[styles.loginCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={logo} style={styles.loginLogo} resizeMode="contain" />
          <Text style={[styles.loginTitle, { color: colors.foreground }]}>Admin Panel</Text>
          <Text style={[styles.loginSub, { color: colors.mutedForeground }]}>Electro Bazar Management</Text>

          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="phone" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Admin mobile number"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
            />
          </View>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Feather name="lock" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Admin password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginBtnText}>Login as Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.mutedForeground }]}>← Back to App</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSub}>Electro Bazar</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Feather name="log-out" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          {[
            { label: 'Products', value: stats.products, icon: 'package' as const, color: '#3b82f6' },
            { label: 'Orders', value: stats.orders, icon: 'shopping-bag' as const, color: '#22c55e' },
            { label: 'Users', value: stats.users, icon: 'users' as const, color: '#f59e0b' },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: 'dollar-sign' as const, color: '#ec4899' },
          ].map(stat => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Feather name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.navGrid}>
          {navItems.map(item => (
            <TouchableOpacity
              key={item.route}
              style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.navIcon, { backgroundColor: item.color + '15' }]}>
                <Feather name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {recentOrders.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Orders</Text>
            {recentOrders.map((order, i) => (
              <View key={i} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.orderRow}>
                  <Text style={[styles.orderId, { color: colors.foreground }]}>
                    #{order.id?.slice(-6)?.toUpperCase()}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: order.status === 'delivered' ? '#22c55e20' : '#f59e0b20' }]}>
                    <Text style={{ color: order.status === 'delivered' ? '#22c55e' : '#f59e0b', fontSize: 11, fontWeight: '600' }}>
                      {order.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.orderTotal, { color: colors.primary }]}>
                  ₹{order.total_price?.toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loginRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loginCard: { width: '100%', maxWidth: 380, borderRadius: 20, borderWidth: 1, padding: 28, gap: 14, alignItems: 'center' },
  loginLogo: { width: 80, height: 80, borderRadius: 20 },
  loginTitle: { fontSize: 24, fontWeight: '800' },
  loginSub: { fontSize: 14 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    width: '100%', paddingHorizontal: 14, paddingVertical: 13,
    borderRadius: 10, borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15 },
  loginBtn: { width: '100%', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backText: { fontSize: 14, marginTop: 4 },
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  logoutBtn: { padding: 8 },
  content: { padding: 16, gap: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  statCard: {
    width: '47%', borderRadius: 14, borderWidth: 1, padding: 14,
    alignItems: 'center', gap: 6,
  },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 4 },
  navGrid: { gap: 8 },
  navCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  navIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  orderCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  orderTotal: { fontSize: 16, fontWeight: '700' },
});
