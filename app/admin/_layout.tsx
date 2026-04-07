import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="products" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="users" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="coupons" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="sliders" />
    </Stack>
  );
}
