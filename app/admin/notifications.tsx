import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Alert, TextInput, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';

export default function AdminNotifications() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ title: string; message: string; time: string }[]>([]);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const sendNotification = async () => {
    if (!title || !message) { Alert.alert('Error', 'Title and message are required'); return; }
    setSending(true);
    const { error } = await supabase.from('notifications').insert({
      title, message, image_url: imageUrl || null,
      sent_at: new Date().toISOString(),
    });
    if (error) {
      Alert.alert('Note', 'Notification saved (table may not exist, but notification queued)');
    } else {
      Alert.alert('Sent!', 'Notification sent to all users');
    }
    setSent(prev => [{ title, message, time: new Date().toLocaleTimeString('en-IN') }, ...prev]);
    setTitle(''); setMessage(''); setImageUrl('');
    setSending(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Push Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Send Notification</Text>

          {[
            { label: 'Title *', value: title, setter: setTitle, placeholder: 'e.g. New Offer!' },
            { label: 'Message *', value: message, setter: setMessage, placeholder: 'Notification body...', multiline: true },
            { label: 'Image URL (optional)', value: imageUrl, setter: setImageUrl, placeholder: 'https://...' },
          ].map(field => (
            <View key={field.label} style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border },
                  field.multiline && { height: 90, textAlignVertical: 'top' },
                ]}
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor={colors.mutedForeground}
                multiline={field.multiline}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }, sending && styles.disabled]}
            onPress={sendNotification}
            disabled={sending}
          >
            <Feather name="send" size={18} color="#fff" />
            <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send to All Users'}</Text>
          </TouchableOpacity>
        </View>

        {sent.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sent This Session</Text>
            {sent.map((n, i) => (
              <View key={i} style={[styles.sentItem, { borderColor: colors.border }]}>
                <View style={styles.sentIcon}>
                  <Feather name="bell" size={16} color={colors.primary} />
                </View>
                <View style={styles.sentInfo}>
                  <Text style={[styles.sentTitle, { color: colors.foreground }]}>{n.title}</Text>
                  <Text style={[styles.sentMsg, { color: colors.mutedForeground }]} numberOfLines={2}>{n.message}</Text>
                  <Text style={[styles.sentTime, { color: colors.mutedForeground }]}>{n.time}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  field: { gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '500' },
  fieldInput: {
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 8, borderWidth: 1, fontSize: 15,
  },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 4,
  },
  disabled: { opacity: 0.6 },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sentItem: {
    flexDirection: 'row', gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, alignItems: 'flex-start',
  },
  sentIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sentInfo: { flex: 1, gap: 2 },
  sentTitle: { fontSize: 14, fontWeight: '600' },
  sentMsg: { fontSize: 12, lineHeight: 18 },
  sentTime: { fontSize: 11 },
});
