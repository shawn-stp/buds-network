
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function EditProfileScreen() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [bio, setBio] = useState('');
  const [productsPageLink, setProductsPageLink] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isNewProfile, setIsNewProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      // Check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        // Profile exists, load data
        setCompanyName(profile.company_name || '');
        setBio(profile.bio || '');
        setProductsPageLink(profile.products_page_link || '');
        setProfilePicture(profile.profile_picture || null);
        setIsNewProfile(false);
      } else {
        // New profile - get company name from user metadata
        const metadata = user.user_metadata;
        if (metadata?.company_name) {
          setCompanyName(metadata.company_name);
        }
        setIsNewProfile(true);
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to upload a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfilePicture = async (userId: string, imageUri: string): Promise<string | null> => {
    try {
      console.log('Uploading profile picture...');

      // Fetch the image as a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);

      const base64Data = await base64Promise;

      // Generate unique filename
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${userId}/profile.${fileExt}`;

      console.log('Uploading to storage:', fileName);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, decode(base64Data), {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    // Validation
    if (!companyName.trim()) {
      Alert.alert('Error', 'Please enter your company name');
      return;
    }

    if (!bio.trim()) {
      Alert.alert('Error', 'Please enter a bio');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'No user found. Please sign in again.');
        return;
      }

      let profilePictureUrl = profilePicture;

      // Upload profile picture if it's a local URI
      if (profilePicture && (profilePicture.startsWith('file://') || profilePicture.startsWith('content://'))) {
        try {
          profilePictureUrl = await uploadProfilePicture(user.id, profilePicture);
        } catch (error) {
          console.error('Failed to upload profile picture:', error);
          Alert.alert(
            'Upload Failed',
            'Failed to upload profile picture. Do you want to continue without it?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false) },
              { text: 'Continue', onPress: () => saveProfile(user.id, null) },
            ]
          );
          return;
        }
      }

      await saveProfile(user.id, profilePictureUrl);
    } catch (error) {
      console.error('Unexpected error saving profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (userId: string, profilePictureUrl: string | null) => {
    try {
      const profileData = {
        user_id: userId,
        company_name: companyName.trim(),
        bio: bio.trim(),
        products_page_link: productsPageLink.trim() || null,
        profile_picture: profilePictureUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error saving profile:', error);
        Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
        return;
      }

      console.log('Profile saved successfully');

      Alert.alert(
        'Success',
        isNewProfile ? 'Your profile has been created!' : 'Your profile has been updated!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (isNewProfile) {
                router.replace('/(tabs)');
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Unexpected error in saveProfile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleSkip = () => {
    if (isNewProfile) {
      Alert.alert(
        'Skip Profile Setup?',
        'You can complete your profile later from the Profile tab.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Skip',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isNewProfile ? 'Create Your Profile' : 'Edit Profile',
          headerShown: true,
          headerBackTitle: 'Back',
          headerRight: () => (
            isNewProfile ? (
              <TouchableOpacity onPress={handleSkip} disabled={isLoading}>
                <Text style={styles.skipButton}>Skip</Text>
              </TouchableOpacity>
            ) : null
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isNewProfile && (
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome to Buds!</Text>
              <Text style={styles.welcomeSubtitle}>
                Let&apos;s set up your profile so other businesses can connect with you.
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.profilePictureSection}>
              <Text style={styles.label}>Profile Picture</Text>
              <TouchableOpacity
                style={styles.profilePictureContainer}
                onPress={pickImage}
                disabled={isLoading}
              >
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <IconSymbol
                      ios_icon_name="camera.fill"
                      android_material_icon_name="camera-alt"
                      size={40}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.placeholderText}>Add Photo</Text>
                  </View>
                )}
                <View style={styles.editBadge}>
                  <IconSymbol
                    ios_icon_name="pencil"
                    android_material_icon_name="edit"
                    size={16}
                    color={colors.card}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <View style={styles.inputContainer}>
                <IconSymbol
                  ios_icon_name="building.2"
                  android_material_icon_name="business"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="Enter your company name"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell other businesses about your company..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                  maxLength={500}
                />
              </View>
              <Text style={styles.characterCount}>{bio.length}/500</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Products Page Link</Text>
              <View style={styles.inputContainer}>
                <IconSymbol
                  ios_icon_name="link"
                  android_material_icon_name="link"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={productsPageLink}
                  onChangeText={setProductsPageLink}
                  placeholder="https://yourcompany.com/products"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isNewProfile ? 'Create Profile' : 'Save Changes'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 24 : 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  skipButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 24,
  },
  profilePictureSection: {
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    alignSelf: 'flex-start',
  },
  profilePictureContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  inputGroup: {
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 0,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});
