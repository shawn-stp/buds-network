
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        setBusinessName(user.user_metadata?.company_name || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSaveBusinessName = async () => {
    if (!businessName.trim()) {
      Alert.alert('Error', 'Please enter a business name');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { company_name: businessName },
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Business name updated successfully');
      }
    } catch (error) {
      console.error('Error updating business name:', error);
      Alert.alert('Error', 'Failed to update business name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    Alert.alert(
      'Change Email',
      'To change your email address, you will need to verify both your current and new email addresses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Alert.prompt(
              'New Email Address',
              'Enter your new email address:',
              async (newEmail) => {
                if (!newEmail || !newEmail.includes('@')) {
                  Alert.alert('Error', 'Please enter a valid email address');
                  return;
                }

                try {
                  const { error } = await supabase.auth.updateUser({
                    email: newEmail,
                  });

                  if (error) {
                    Alert.alert('Error', error.message);
                  } else {
                    Alert.alert(
                      'Verify Your Email',
                      'We\'ve sent verification emails to both your current and new email addresses. Please verify both to complete the change.',
                      [{ text: 'OK' }]
                    );
                  }
                } catch (error) {
                  console.error('Error changing email:', error);
                  Alert.alert('Error', 'Failed to change email address');
                }
              },
              'plain-text',
              '',
              'email-address'
            );
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      `We'll send a password reset link to ${userEmail}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Link',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
                redirectTo: 'https://natively.dev/email-confirmed',
              });

              if (error) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert(
                  'Check Your Email',
                  'Password reset instructions have been sent to your email address.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error sending password reset:', error);
              Alert.alert('Error', 'Failed to send password reset email');
            }
          },
        },
      ]
    );
  };

  const handleBlockedUsers = () => {
    Alert.alert('Blocked Users', 'Blocked users list will be shown here');
  };

  const handleManageSubscription = () => {
    Alert.alert('Manage Subscription', 'Subscription management will be implemented with backend');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                Alert.alert('Error', error.message);
              } else {
                console.log('User logged out successfully');
                router.replace('/');
              }
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to log out');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Deletion',
              'Type "DELETE" to confirm account deletion:',
              async (text) => {
                if (text === 'DELETE') {
                  try {
                    // Note: Supabase doesn't have a direct delete user method from client
                    // You would need to implement this via an Edge Function or admin API
                    Alert.alert(
                      'Account Deletion',
                      'Please contact support to delete your account. We will process your request within 24 hours.',
                      [{ text: 'OK' }]
                    );
                  } catch (error) {
                    console.error('Error deleting account:', error);
                    Alert.alert('Error', 'Failed to delete account');
                  }
                } else {
                  Alert.alert('Error', 'Confirmation text does not match');
                }
              },
              'plain-text'
            );
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Account Settings',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Business Name</Text>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Enter business name"
                placeholderTextColor={colors.textSecondary}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
                onPress={handleSaveBusinessName}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.settingItem} onPress={handleChangeEmail}>
                <View style={styles.settingItemLeft}>
                  <IconSymbol
                    ios_icon_name="envelope"
                    android_material_icon_name="email"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.settingItemTextContainer}>
                    <Text style={styles.settingItemText}>Change Email Address</Text>
                    <Text style={styles.settingItemSubtext}>{userEmail}</Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
                <View style={styles.settingItemLeft}>
                  <IconSymbol
                    ios_icon_name="lock"
                    android_material_icon_name="lock"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.settingItemText}>Change Password</Text>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Safety</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.settingItem} onPress={handleBlockedUsers}>
                <View style={styles.settingItemLeft}>
                  <IconSymbol
                    ios_icon_name="hand.raised"
                    android_material_icon_name="block"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.settingItemText}>Blocked Users</Text>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.settingItem} onPress={handleManageSubscription}>
                <View style={styles.settingItemLeft}>
                  <IconSymbol
                    ios_icon_name="creditcard"
                    android_material_icon_name="credit-card"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.settingItemText}>Manage Subscription</Text>
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

          <View style={styles.section}>
            <View style={styles.card}>
              <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                <View style={styles.settingItemLeft}>
                  <IconSymbol
                    ios_icon_name="arrow.right.square"
                    android_material_icon_name="logout"
                    size={24}
                    color={colors.error}
                  />
                  <Text style={[styles.settingItemText, styles.logoutText]}>Log Out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.card}>
              <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
                <View style={styles.settingItemLeft}>
                  <IconSymbol
                    ios_icon_name="trash"
                    android_material_icon_name="delete"
                    size={24}
                    color={colors.error}
                  />
                  <Text style={[styles.settingItemText, styles.deleteText]}>Delete Account</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
    marginHorizontal: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingItemTextContainer: {
    flex: 1,
  },
  settingItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  settingItemSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutText: {
    color: colors.error,
  },
  deleteText: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 52,
  },
});
