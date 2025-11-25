
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');

interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string;
  product_type: string;
  images: string[];
  price: number | null;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  company_name: string;
  profile_picture: string | null;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);

      // Load product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error loading product:', productError);
        Alert.alert('Error', 'Failed to load product details');
        return;
      }

      setProduct(productData);

      // Load seller profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', productData.user_id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error in loadProduct:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    if (!product) return;

    Alert.alert(
      'Contact Seller',
      `Would you like to contact ${profile?.company_name || 'the seller'} about ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Message', 
          onPress: () => {
            console.log('Sending message about:', product.name);
            // TODO: Navigate to messages or open contact method
          }
        },
      ]
    );
  };

  const handleViewSellerProfile = () => {
    if (!product) return;
    router.push({
      pathname: '/user-profile',
      params: { userId: product.user_id }
    });
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined || isNaN(price)) {
      return 'Price not set';
    }
    return `$${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Product Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Product not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Product Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {product.images && product.images.length > 0 ? (
            <>
              <Image
                source={{ uri: product.images[selectedImageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              {product.images.length > 1 && (
                <View style={styles.thumbnailContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.thumbnailScroll}
                  >
                    {product.images.map((image, index) => (
                      <React.Fragment key={index}>
                        <TouchableOpacity
                          onPress={() => setSelectedImageIndex(index)}
                          style={[
                            styles.thumbnail,
                            selectedImageIndex === index && styles.thumbnailActive
                          ]}
                        >
                          <Image
                            source={{ uri: image }}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      </React.Fragment>
                    ))}
                  </ScrollView>
                </View>
              )}
              {product.images.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {selectedImageIndex + 1} / {product.images.length}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <IconSymbol
                ios_icon_name="photo"
                android_material_icon_name="image"
                size={64}
                color={colors.textSecondary}
              />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productType}>{product.product_type}</Text>
            </View>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Seller Info */}
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <TouchableOpacity
              style={styles.sellerCard}
              onPress={handleViewSellerProfile}
            >
              {profile?.profile_picture ? (
                <Image
                  source={{ uri: profile.profile_picture }}
                  style={styles.sellerImage}
                />
              ) : (
                <View style={styles.sellerImagePlaceholder}>
                  <IconSymbol
                    ios_icon_name="person.fill"
                    android_material_icon_name="person"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              )}
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>
                  {profile?.company_name || 'Unknown Seller'}
                </Text>
                <Text style={styles.viewProfile}>View Profile</Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Contact Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContact}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="paperplane.fill"
            android_material_icon_name="send"
            size={20}
            color={colors.card}
          />
          <Text style={styles.contactButtonText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 16,
    backgroundColor: colors.card,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  imageGallery: {
    backgroundColor: colors.card,
  },
  mainImage: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailContainer: {
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  thumbnailScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  productType: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  sellerSection: {
    marginTop: 0,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sellerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  sellerImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  viewProfile: {
    fontSize: 14,
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
