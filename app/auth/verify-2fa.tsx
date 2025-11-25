
import React, { useState, useEffect } from 'react';
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
import { generateEmailVerificationCode, sendVerificationEmail, verifyEmailCode } from '@/utils/authUtils';

export default function Verify2FAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email } = params;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Automatically send email when component mounts
    handleSendEmail();
  }, []);

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    
    // Generate a 6-digit code
    const code = generateEmailVerificationCode();
    
    // Send email (simulated)
    const success = await sendVerificationEmail(email as string, code);
    
    if (success) {
      setEmailSent(true);
    } else {
      Alert.alert('Error', 'Failed to send verification email. Please try again.');
    }
    
    setIsSendingEmail(false);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);

    // Verify the code
    const isValid = await verifyEmailCode(email as string, verificationCode);

    if (isValid) {
      console.log('2FA verification successful');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Invalid or expired verification code. Please try again or request a new code.');
      setVerificationCode('');
    }
    
    setIsVerifying(false);
  };

  const handleResendCode = () => {
    Alert.alert(
      'Resend Code?',
      'Do you want to receive a new verification code?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resend',
          onPress: () => {
            setVerificationCode('');
            handleSendEmail();
          },
        },
      ]
    );
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
                ios_icon_name="envelope.badge.shield.half.filled"
                android_material_icon_name="mark-email-read"
                size={48}
                color={colors.primary}
              />
            </View>
            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your email
            </Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          {!emailSent && isSendingEmail && (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Sending verification code...</Text>
            </View>
          )}

          {emailSent && (
            <View style={styles.successCard}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.successText}>Code sent to your email!</Text>
            </View>
          )}

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
                autoFocus={emailSent}
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={isVerifying || !emailSent}
            >
              <Text style={styles.verifyButtonText}>
                {isVerifying ? 'Verifying...' : 'Verify & Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={isSendingEmail}
            >
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.resendButtonText}>
                {isSendingEmail ? 'Sending...' : 'Resend Code'}
              </Text>
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
              Check your email inbox for the verification code. The code will expire in 10 minutes.
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
    marginBottom: 32,
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
  loadingCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  successCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  successText: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
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
