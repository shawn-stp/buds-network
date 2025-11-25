
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { get2FASecret, verifyTOTP } from '@/utils/authUtils';

export default function Verify2FAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email } = params;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);

    // In production, retrieve the user's 2FA secret from secure storage
    // For demo purposes, we'll simulate verification
    const mockUserId = 'user_mock';
    const secret = await get2FASecret(mockUserId);

    // Simulate verification delay
    setTimeout(() => {
      // For demo, accept any 6-digit code
      const isValid = verificationCode.length === 6;

      if (isValid) {
        console.log('2FA verification successful');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid verification code. Please try again.');
        setVerificationCode('');
      }
      
      setIsVerifying(false);
    }, 1000);
  };

  const handleResendCode = () => {
    Alert.alert('Code Sent', 'A new verification code has been sent to your authenticator app.');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Verify Identity',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="lock.shield"
                android_material_icon_name="security"
                size={48}
                color={colors.primary}
              />
            </View>
            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code from your authenticator app
            </Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.codeInputContainer}>
              <IconSymbol
                ios_icon_name="number"
                android_material_icon_name="pin"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.codeInput}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="000000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={isVerifying}
            >
              <Text style={styles.verifyButtonText}>
                {isVerifying ? 'Verifying...' : 'Verify & Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
              <Text style={styles.resendButtonText}>Having trouble? Get help</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <IconSymbol
              ios_icon_name="info.circle"
              android_material_icon_name="info"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Open your authenticator app and enter the current 6-digit code to continue.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  codeInputContainer: {
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
  codeInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'SpaceMono',
    color: colors.text,
    letterSpacing: 8,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
