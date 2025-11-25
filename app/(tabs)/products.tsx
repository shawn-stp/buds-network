
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

const productTypes = ['All', 'Flower', 'Pre Roll', 'Edible', 'Tincture', 'Topical', 'Beverage', 'Concentrate'];

interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  product_type: string;
  images: string[];
  price: number;
  created_at: string;
}

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const viewUserId = params.userId as string | undefined;

  const [filter, setFilter] = useState<string[]>(['All']);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in');
        return;
      }

      setCurrentUserId(user.id);

      // Determine which user's products to show
      const targetUserId = viewUserId || user.id;
      setIsOwnProfile(targetUserId === user.id);

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error loading products:', productsError);
        return;
      }

      setProducts(productsData || []);
      console.log(`Loaded ${productsData?.length || 0} products for user ${targetUserId}`);
    } catch (error) {
      console.error('Error in loadProducts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [viewUserId])
  );

  const filteredProducts = products.filter(product => {
    if (filter.includes('All')) return true;
    return filter.includes(product.product_type);
  });

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product-detail',
      params: { productId: product.id }
    });
  };

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
      setFilter(['All']);
    } else {
      setFilter(prev => {
        const newTypes = prev.includes(type)
          ? prev.filter(t => t !== type)
          : [...prev.filter(t => t !== 'All'), type];
        return newTypes.length === 0 ? ['All'] : newTypes;
      });
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <IconSymbol
            ios_icon_name="photo"
            android_material_icon_name="image"
            size={32}
            color={colors.textSecondary}
          />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productType}>{item.product_type}</Text>
        {item.price && (
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.contactButton}
        onPress={(e) => {
          e.stopPropagation();
          handleContact(item);
        }}
      >
        <IconSymbol
          ios_icon_name="paperplane"
          android_material_icon_name="send"
          size={16}
          color={colors.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {viewUserId && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
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
              style={[
                styles.typeChip,
                filter.includes(type) && styles.typeChipActive,
              ]}
              onPress={() => toggleType(type)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  filter.includes(type) && styles.typeChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="cube.box"
            android_material_icon_name="inventory"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            {isOwnProfile ? 'No products yet' : 'This user has no products'}
          </Text>
          {isOwnProfile && (
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first product
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isOwnProfile && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/create-product')}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={28}
            color="white"
          />
        </TouchableOpacity>
      )}

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
              <Text style={styles.filterLabel}>Product Types</Text>
              <View style={styles.typeList}>
                {productTypes.map((type, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        filter.includes(type) && styles.typeOptionActive,
                      ]}
                      onPress={() => toggleType(type)}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          filter.includes(type) && styles.typeOptionTextActive,
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  filterButton: {
    padding: 8,
  },
  typeFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
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
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: colors.border,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  productType: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  contactButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.card,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
