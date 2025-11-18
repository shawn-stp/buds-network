
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { ProductCard } from '@/components/ProductCard';
import { mockProducts, currentUserId } from '@/data/mockData';
import { Product, ProductFilter } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';

const productTypes = ['All', 'Software', 'Packaging', 'Equipment', 'Service'];

export default function ProductsScreen() {
  const [filter, setFilter] = useState<ProductFilter>({
    priceRange: { min: 0, max: 10000 },
    types: ['All'],
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = mockProducts.filter(product => {
    const matchesPrice = product.price >= filter.priceRange.min && product.price <= filter.priceRange.max;
    const matchesType = filter.types.includes('All') || filter.types.includes(product.type);
    return matchesPrice && matchesType;
  });

  const handleContact = (product: Product) => {
    Alert.alert(
      'Contact Seller',
      `Would you like to contact the seller about ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Message', onPress: () => console.log('Sending message about:', product.name) },
      ]
    );
  };

  const toggleType = (type: string) => {
    if (type === 'All') {
      setFilter(prev => ({ ...prev, types: ['All'] }));
    } else {
      setFilter(prev => {
        const newTypes = prev.types.includes(type)
          ? prev.types.filter(t => t !== type)
          : [...prev.types.filter(t => t !== 'All'), type];
        return { ...prev, types: newTypes.length === 0 ? ['All'] : newTypes };
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <IconSymbol
            ios_icon_name="slider.horizontal.3"
            android_material_icon_name="tune"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.typeFilters}>
        {productTypes.map((type, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              key={index}
              style={[
                styles.typeChip,
                filter.types.includes(type) && styles.typeChipActive,
              ]}
              onPress={() => toggleType(type)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  filter.types.includes(type) && styles.typeChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductCard product={item} onContact={handleContact} />}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.priceInputs}>
                <View style={styles.priceInput}>
                  <Text style={styles.priceInputLabel}>Min: ${filter.priceRange.min}</Text>
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.priceInputLabel}>Max: ${filter.priceRange.max}</Text>
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Product Types</Text>
              <View style={styles.typeList}>
                {productTypes.map((type, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.typeOption,
                        filter.types.includes(type) && styles.typeOptionActive,
                      ]}
                      onPress={() => toggleType(type)}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          filter.types.includes(type) && styles.typeOptionTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 16,
    backgroundColor: colors.card,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  filterButton: {
    padding: 8,
  },
  typeFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: colors.card,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  priceInputLabel: {
    fontSize: 14,
    color: colors.text,
  },
  typeList: {
    gap: 8,
  },
  typeOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  typeOptionTextActive: {
    color: colors.card,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});
