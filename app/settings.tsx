
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { mockUsers, currentUserId } from '@/data/mockData';
import { get2FASecret, delete2FASecret } from '@/utils/authUtils';

export default function SettingsScreen() {
  const router = useRouter();
  const currentUser = mockUsers.find(u => u.id === currentUserId);
  const [businessName, setBusinessName] = useState(currentUser?.companyName || '');
  const [has2FA, setHas2FA] = useState(false);

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    const secret = await get2FASecret(currentUserId);
    setHas2FA(!!secret);
  };

  const handleSaveBusinessName = () => {
    console.log('Save business name:', businessName);
    Alert.alert('Success', 'Business name updated successfully');
  };

  const handleChangeEmail = () => {
    console.log('Change email');
    Alert.alert('Change Email', 'Email change functionality will be implemented with backend');
  };

  const handleChangePassword = () => {
    console.log('Change password');
    Alert.alert('Change Password', 'Password change functionality will be implemented with backend');
  };

  const handleToggle2FA = () => {
    if (has2FA) {
      Alert.alert(
        'Disable 2FA',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await delete2FASecret(currentUserId);
              setHas2FA(false);
              Alert.alert('Success', 'Two-factor authentication has been disabled');
            },
          },
        ]
      );
    } else {
      router.push({
        pathname: '/auth/setup-2fa',
        params: { email: 'user@example.com', companyName: businessName },
      });
    }
  };

  const handleManageSubscription = () => {
    console.log('Manage subscription');
    Alert.alert('Manage Subscription', 'Subscription management will be implemented with backend');
  };

  const handleBlockedUsers = () => {
    console.log('View blocked users');
    Alert.alert('Blocked Users', 'Blocked users list will be shown here');
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
          onPress: () => {
            console.log('User logged out');
            Alert.alert('Logged Out', 'You have been logged out successfully');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Account deletion requested');
            Alert.alert('Account Deleted', 'Your account has been scheduled for deletion');
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
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveBusinessName}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
                  <Text style={styles.settingItemText}>Change Email Address</Text>
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

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingItem} onPress={handleToggle2FA}>
                <View style={styles.settingItemLeft}>
                  <IconSymbol
                    ios_icon_name="lock.shield"
                    android_material_icon_name="security"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.settingItemTextContainer}>
                    <Text style={styles.settingItemText}>Two-Factor Authentication</Text>
                    <Text style={styles.settingItemSubtext}>
                      {has2FA ? 'Enabled' : 'Add extra security to your account'}
                    </Text>
                  </View>
                </View>
                <View style={styles.settingItemRight}>
                  {has2FA && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>ON</Text>
                    </View>
                  )}
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
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
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.card,
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
