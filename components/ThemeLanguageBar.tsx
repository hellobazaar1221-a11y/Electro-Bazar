import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/constants/translations';

export default function ThemeLanguageBar() {
  const colors = useColors();
  const { themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const themeIcons: Record<ThemeMode, React.ComponentProps<typeof Feather>['name']> = {
    light: 'sun',
    dark: 'moon',
    system: 'monitor',
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
        onPress={() => setLangOpen(true)}
      >
        <Feather name="globe" size={14} color="#fff" />
        <Text style={styles.btnText}>{language === 'en' ? 'EN' : 'HI'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
        onPress={() => setThemeOpen(true)}
      >
        <Feather name={themeIcons[themeMode]} size={14} color="#fff" />
      </TouchableOpacity>

      <Modal visible={langOpen} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setLangOpen(false)}>
          <View style={[styles.popup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.popupTitle, { color: colors.foreground }]}>{t.language}</Text>
            {(['en', 'hi'] as Language[]).map(lang => (
              <TouchableOpacity
                key={lang}
                style={[styles.option, language === lang && { backgroundColor: colors.primary + '20' }]}
                onPress={() => { setLanguage(lang); setLangOpen(false); }}
              >
                <Text style={[styles.optionText, { color: language === lang ? colors.primary : colors.foreground }]}>
                  {lang === 'en' ? '🇺🇸 English' : '🇮🇳 हिंदी'}
                </Text>
                {language === lang && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={themeOpen} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setThemeOpen(false)}>
          <View style={[styles.popup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.popupTitle, { color: colors.foreground }]}>{t.theme}</Text>
            {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
              <TouchableOpacity
                key={mode}
                style={[styles.option, themeMode === mode && { backgroundColor: colors.primary + '20' }]}
                onPress={() => { setThemeMode(mode); setThemeOpen(false); }}
              >
                <Feather name={themeIcons[mode]} size={16} color={themeMode === mode ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.optionText, { color: themeMode === mode ? colors.primary : colors.foreground }]}>
                  {mode === 'light' ? t.light : mode === 'dark' ? t.dark : t.system}
                </Text>
                {themeMode === mode && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    width: 240,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
});
