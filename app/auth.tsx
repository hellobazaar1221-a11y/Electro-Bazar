import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform,
  KeyboardAvoidingView, Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

const logo = require('@/assets/images/icon.png');

type Mode = 'login' | 'signup';
type LoginMethod = 'email' | 'phone';

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleEmailSubmit = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    if (mode === 'signup' && !name) { Alert.alert('Error', 'Please enter your name'); return; }
    setLoading(true);
    let result: { error: string | null };
    if (mode === 'login') {
      result = await signInWithEmail(email, password);
    } else {
      result = await signUpWithEmail(email, password, name);
    }
    setLoading(false);
    if (result.error) Alert.alert('Error', result.error);
    else router.replace('/' as any);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) { Alert.alert('Error', 'Enter valid mobile number'); return; }
    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else { setOtpSent(true); Alert.alert('OTP Sent', `OTP sent to ${formattedPhone}`); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) { Alert.alert('Error', 'Enter OTP'); return; }
    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else router.replace('/' as any);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.logoSection}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.logoTitle, { color: colors.foreground }]}>Electro Bazar</Text>
          <Text style={[styles.logoSubtitle, { color: colors.mutedForeground }]}>
            {mode === 'login' ? t.signIn : t.signUp}
          </Text>
        </View>

        {mode === 'login' && (
          <View style={[styles.methodToggle, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.methodBtn, loginMethod === 'email' && { backgroundColor: colors.primary }]}
              onPress={() => { setLoginMethod('email'); setOtpSent(false); }}
            >
              <Text style={[styles.methodText, { color: loginMethod === 'email' ? '#fff' : colors.foreground }]}>
                {t.emailLogin}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodBtn, loginMethod === 'phone' && { backgroundColor: colors.primary }]}
              onPress={() => { setLoginMethod('phone'); setOtpSent(false); }}
            >
              <Text style={[styles.methodText, { color: loginMethod === 'phone' ? '#fff' : colors.foreground }]}>
                {t.mobileLogin}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.form}>
          {(mode === 'signup' || loginMethod === 'email') && (
            <>
              {mode === 'signup' && (
                <View style={[styles.inputWrapper, { borderColor: colors.input, backgroundColor: colors.card }]}>
                  <Feather name="user" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder={t.fullName}
                    placeholderTextColor={colors.mutedForeground}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}
              <View style={[styles.inputWrapper, { borderColor: colors.input, backgroundColor: colors.card }]}>
                <Feather name="mail" size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder={t.emailAddress}
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={[styles.inputWrapper, { borderColor: colors.input, backgroundColor: colors.card }]}>
                <Feather name="lock" size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder={t.password}
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && styles.disabled]}
                onPress={handleEmailSubmit}
                disabled={loading}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Please wait...' : (mode === 'login' ? t.signIn : t.signUp)}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {mode === 'login' && loginMethod === 'phone' && (
            <>
              <View style={[styles.inputWrapper, { borderColor: colors.input, backgroundColor: colors.card }]}>
                <Text style={[styles.countryCode, { color: colors.mutedForeground }]}>🇮🇳 +91</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder={t.mobileNumber}
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {otpSent && (
                <View style={[styles.inputWrapper, { borderColor: colors.input, backgroundColor: colors.card }]}>
                  <Feather name="shield" size={18} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder={t.enterOtp}
                    placeholderTextColor={colors.mutedForeground}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              )}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }, loading && styles.disabled]}
                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Please wait...' : (otpSent ? t.verifyOtp : t.sendOtp)}
                </Text>
              </TouchableOpacity>
              {otpSent && (
                <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.resendRow}>
                  <Text style={[styles.resendText, { color: colors.primary }]}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {mode === 'login' && (
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => setMode('signup')}>
              <Text style={[styles.switchLink, { color: colors.primary }]}>{t.signUp}</Text>
            </TouchableOpacity>
          </View>
        )}
        {mode === 'signup' && (
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => setMode('login')}>
              <Text style={[styles.switchLink, { color: colors.primary }]}>{t.signIn}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, gap: 20, flexGrow: 1 },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  logoSection: { alignItems: 'center', gap: 8, marginVertical: 8 },
  logo: { width: 90, height: 90, borderRadius: 22 },
  logoTitle: { fontSize: 26, fontWeight: '800' },
  logoSubtitle: { fontSize: 15 },
  methodToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  methodBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  methodText: { fontSize: 14, fontWeight: '600' },
  form: { gap: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  countryCode: { fontSize: 15, fontWeight: '600' },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  submitBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: '600' },
  resendRow: { alignItems: 'center', marginTop: -4 },
  resendText: { fontSize: 14, fontWeight: '600' },
});
