import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Category } from '@/types';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

const iconMap: Record<string, FeatherIconName> = {
  smartphone: 'smartphone',
  headphones: 'headphones',
  tablet: 'tablet',
  laptop: 'monitor',
  camera: 'camera',
  tv: 'tv',
  watch: 'watch',
  'gamepad-2': 'cpu',
  Mobiles: 'smartphone',
  Audio: 'headphones',
  Tablets: 'tablet',
  Laptops: 'monitor',
  Cameras: 'camera',
  TVs: 'tv',
  Wearables: 'watch',
  Gaming: 'cpu',
};

interface Props {
  categories: Category[];
  selected?: string;
  onSelect: (id: string | undefined) => void;
}

export default function CategoryChips({ categories, selected, onSelect }: Props) {
  const colors = useColors();

  return (
    <FlatList
      data={[{ id: '', name: 'All', icon: 'grid' } as Category, ...categories]}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isSelected = (item.id === '' && !selected) || item.id === selected;
        const iconName = iconMap[item.icon || ''] || iconMap[item.name] || 'box' as FeatherIconName;
        return (
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(item.id === '' ? undefined : item.id)}
            activeOpacity={0.7}
          >
            <Feather
              name={item.id === '' ? 'grid' : iconName}
              size={14}
              color={isSelected ? '#fff' : colors.mutedForeground}
            />
            <Text
              style={[
                styles.label,
                { color: isSelected ? '#fff' : colors.foreground },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
