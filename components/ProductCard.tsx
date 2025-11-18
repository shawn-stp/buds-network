
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { Product } from '@/types';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2;

interface ProductCardProps {
  product: Product;
  onContact?: (product: Product) => void;
}

export function ProductCard({ product, onContact }: ProductCardProps) {
  const handleContact = () => {
    console.log('Contact seller for product:', product.id);
    onContact?.(product);
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price}</Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <IconSymbol
              ios_icon_name="envelope"
              android_material_icon_name="email"
              size={16}
              color={colors.card}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: cardWidth,
    backgroundColor: colors.border,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  contactButton: {
    backgroundColor: colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
