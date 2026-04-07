import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';

interface MenuItemProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  badge?: number;
}

function MenuItem({ icon, label, subtitle, onPress, danger, badge }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.destructive + '15' : colors.muted }]}>
        <Feather name={icon} size={18} color={danger ? colors.destructive : colors.primary} />
      </View>
      <View style={styles.menuLabel}>
        <Text style={[styles.menuText, { color: danger ? colors.destructive : colors.foreground }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
        )}
      </View>
      {badge !== undefined && badge > 0 && (
        <View style={[styles.menuBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, session, signOut } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { t } = useLanguage();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : insets.bottom + 60;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.primary }]}
          onPress={() => session ? router.push('/profile' as any) : router.push('/auth' as any)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name[0].toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.name ?? 'Guest User'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email ?? session ? 'Tap to edit profile' : 'Tap to sign in'}
            </Text>
          </View>
          <Feather name="edit-2" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem
            icon="package"
            label="My Orders"
            subtitle="Track & manage orders"
            onPress={() => router.push('/orders' as any)}
          />
          <MenuItem
            icon="heart"
            label="Wishlist"
            subtitle="Saved products"
            badge={wishlistItems.length}
            onPress={() => router.push('/wishlist' as any)}
          />
          <MenuItem
            icon="map-pin"
            label="Addresses"
            subtitle="Manage delivery addresses"
            onPress={() => router.push('/addresses' as any)}
          />
          <MenuItem
            icon="tag"
            label="Coupons"
            subtitle="Discount codes & offers"
            onPress={() => router.push('/coupons' as any)}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem
            icon="phone"
            label="Call Us"
            subtitle="+91 9504912525"
            onPress={() => Linking.openURL('tel:+919504912525')}
          />
          <MenuItem
            icon="mail"
            label="Email Support"
            subtitle="electrobazar0@gmail.com"
            onPress={() => Linking.openURL('mailto:electrobazar0@gmail.com')}
          />
          <MenuItem
            icon="help-circle"
            label="Help Center"
            subtitle="FAQs & guides"
            onPress={() => {}}
          />
        </View>

        {session && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MenuItem
              icon="log-out"
              label="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </View>
        )}

        {!session && (
          <TouchableOpacity
            style={[styles.signInBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/auth' as any)}
          >
            <Text style={styles.signInText}>Sign In / Register</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem
            icon="settings"
            label="Admin Panel"
            subtitle="Manage app content"
            onPress={() => router.push('/admin' as any)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  content: { padding: 16, gap: 16 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  profileEmail: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, gap: 2 },
  menuText: { fontSize: 15, fontWeight: '500' },
  menuSubtitle: { fontSize: 12 },
  menuBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  signInBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
