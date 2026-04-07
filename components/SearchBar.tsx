import React, { useState } from 'react';
import {
  View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

interface Props {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [focused, setFocused] = useState(false);

  const handleChange = async (text: string) => {
    setQuery(text);
    if (text.length < 2) { setSuggestions([]); return; }
    const { data } = await supabase
      .from('products')
      .select('id, name, price, images, discount')
      .ilike('name', `%${text}%`)
      .limit(5);
    setSuggestions((data || []).map((p: any) => ({ ...p, images: p.images || [], stock: 1 })));
  };

  const handleSubmit = () => {
    setSuggestions([]);
    onSearch?.(query);
    router.push({ pathname: '/search', params: { q: query } } as any);
  };

  return (
    <View>
      <View style={[styles.bar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder="Search products..."
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setSuggestions([]); }}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {focused && suggestions.length > 0 && (
        <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {suggestions.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.suggestion}
              onPress={() => {
                setSuggestions([]);
                setQuery('');
                router.push(`/product/${item.id}` as any);
              }}
            >
              <View style={[styles.thumbContainer, { backgroundColor: colors.muted }]}>
                {item.images[0] ? (
                  <Image source={{ uri: item.images[0] }} style={styles.thumb} resizeMode="contain" />
                ) : (
                  <Feather name="package" size={16} color={colors.mutedForeground} />
                )}
              </View>
              <View style={styles.suggestionInfo}>
                <Text style={[styles.suggestionName, { color: colors.foreground }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.suggestionPrice, { color: colors.primary }]}>
                  ₹{item.price.toLocaleString('en-IN')}
                </Text>
              </View>
              <Feather name="arrow-up-left" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  suggestions: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 100,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  thumbContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  suggestionInfo: {
    flex: 1,
    gap: 2,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '500',
  },
  suggestionPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
});
