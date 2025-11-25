
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { generateEmailVerificationCode, sendVerificationEmail, verifyEmailCode } from '@/utils/authUtils';

export default function Setup2FAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email, companyName } = params;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    // Automatically send email when component mounts
    handleSendEmail();
  }, []);

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    
    // Generate a 6-digit code
    const code = generateEmailVerificationCode();
    setGeneratedCode(code);
    
    // Send email (simulated)
    const success = await sendVerificationEmail(email as string, code);
    
    if (success) {
      setEmailSent(true);
      Alert.alert(
        'Email Sent!',
        `A verification code has been sent to ${email}. Please check your email and enter the code below.`,
        [{ text: 'OK' }]
      );
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
      Alert.alert(
        'Success!',
        'Two-factor authentication has been enabled for your account.',
        [
          {
            text: 'Continue',
            onPress: () => {
              console.log('2FA setup complete, navigating to app');
              router.replace('/(tabs)');
            },
          },
        ]
      );
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

  const handleSkip = () => {
    Alert.alert(
      'Skip 2FA Setup?',
      'Two-factor authentication adds an extra layer of security to your account. Are you sure you want to skip this step?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            console.log('User skipped 2FA setup');
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Enable 2FA',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="envelope.badge.shield.half.filled"
              android_material_icon_name="mark-email-read"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>Secure Your Account</Text>
          <Text style={styles.subtitle}>
            We&apos;ve sent a verification code to your email address
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Check Your Email</Text>
          <Text style={styles.description}>
            A 6-digit verification code has been sent to your email address. The code will expire in 10 minutes.
          </Text>
          
          {!emailSent && isSendingEmail && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Sending email...</Text>
            </View>
          )}

          {emailSent && (
            <View style={styles.successContainer}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.successText}>Email sent successfully!</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Enter Verification Code</Text>
          <Text style={styles.description}>
            Enter the 6-digit code from your email:
          </Text>
          
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
              {isVerifying ? 'Verifying...' : 'Verify & Enable 2FA'}
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
            Didn&apos;t receive the email? Check your spam folder or click &quot;Resend Code&quot; to receive a new one.
          </Text>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
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
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 28,
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  successContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
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
    marginTop: 16,
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
    marginTop: 12,
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
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
