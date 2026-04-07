import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export default function OrderSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 15 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconCircle, { backgroundColor: '#22c55e20', transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconInner, { backgroundColor: '#22c55e' }]}>
            <Feather name="check" size={40} color="#fff" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textSection, { opacity: opacityAnim }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Order Placed!</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Your order has been placed successfully. We'll confirm it shortly.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: opacityAnim }]}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/orders' as any)}
          >
            <Text style={styles.btnText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.muted }]}
            onPress={() => router.replace('/' as any)}
          >
            <Text style={[styles.btnText, { color: colors.foreground }]}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: { alignItems: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  actions: { width: '100%', gap: 12 },
  btn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
