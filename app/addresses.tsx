import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

const ADDR_KEY = 'electrobazar_addresses';

export default function AddressesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [adding, setAdding] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  React.useEffect(() => {
    AsyncStorage.getItem(ADDR_KEY).then(stored => {
      if (stored) setAddresses(JSON.parse(stored));
    });
  }, []);

  const save = async (updated: Address[]) => {
    setAddresses(updated);
    await AsyncStorage.setItem(ADDR_KEY, JSON.stringify(updated));
  };

  const useCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode) {
        setLine1([geocode.street, geocode.streetNumber, geocode.district].filter(Boolean).join(', '));
        setCity(geocode.city ?? geocode.subregion ?? '');
        setState(geocode.region ?? '');
        setPincode(geocode.postalCode ?? '');
        Alert.alert('Location fetched!', 'Address fields have been filled');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not fetch location. Please fill manually.');
    } finally {
      setFetchingLocation(false);
    }
  };

  const addAddress = async () => {
    if (!name || !phone || !line1 || !city || !pincode) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const newAddr: Address = {
      id: Date.now().toString(),
      name, phone, line1, city, state, pincode,
      is_default: addresses.length === 0,
    };
    await save([...addresses, newAddr]);
    setAdding(false);
    setName(''); setPhone(''); setLine1(''); setCity(''); setState(''); setPincode('');
    Alert.alert('Saved!', 'Address added successfully');
  };

  const deleteAddress = async (id: string) => {
    await save(addresses.filter(a => a.id !== id));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t.addresses}</Text>
        <TouchableOpacity onPress={() => setAdding(true)}>
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        {adding && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>{t.addAddress}</Text>

            <TouchableOpacity
              style={[styles.locationBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
              onPress={useCurrentLocation}
              disabled={fetchingLocation}
            >
              {fetchingLocation ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Feather name="map-pin" size={16} color={colors.primary} />
              )}
              <Text style={[styles.locationBtnText, { color: colors.primary }]}>
                {fetchingLocation ? t.fetchingLocation : t.useCurrentLocation}
              </Text>
            </TouchableOpacity>

            {[
              { label: t.fullName, value: name, setter: setName, placeholder: 'Recipient name' },
              { label: 'Phone', value: phone, setter: setPhone, placeholder: '10-digit mobile', keyboard: 'phone-pad' as const },
              { label: 'Address', value: line1, setter: setLine1, placeholder: 'Street, Area, Landmark' },
              { label: 'City', value: city, setter: setCity, placeholder: 'City' },
              { label: 'State', value: state, setter: setState, placeholder: 'State' },
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

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setAdding(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={addAddress}
              >
                <Text style={styles.saveBtnText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {addresses.length === 0 && !adding ? (
          <View style={styles.empty}>
            <Feather name="map-pin" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No addresses saved</Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => setAdding(true)}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.addBtnText}>{t.addAddress}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map(addr => (
            <View key={addr.id} style={[styles.addrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.addrHeader}>
                <View style={styles.addrNameRow}>
                  <Feather name="map-pin" size={16} color={colors.primary} />
                  <Text style={[styles.addrName, { color: colors.foreground }]}>{addr.name}</Text>
                  {addr.is_default && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => deleteAddress(addr.id)}>
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.addrText, { color: colors.mutedForeground }]}>
                {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
              </Text>
              <Text style={[styles.addrPhone, { color: colors.mutedForeground }]}>{addr.phone}</Text>
            </View>
          ))
        )}
      </ScrollView>
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
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  formTitle: { fontSize: 17, fontWeight: '700' },
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  locationBtnText: { fontSize: 14, fontWeight: '600' },
  field: { gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '500' },
  fieldInput: {
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1, fontSize: 15,
  },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  cancelBtnText: { fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
  },
  addBtnText: { color: '#fff', fontWeight: '600' },
  addrCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  addrHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addrNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  addrName: { fontSize: 15, fontWeight: '600' },
  defaultBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addrText: { fontSize: 13, lineHeight: 20 },
  addrPhone: { fontSize: 12 },
});
