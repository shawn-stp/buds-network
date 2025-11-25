
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
import { generateTOTPSecret, generateQRCodeData, store2FASecret, verifyTOTP } from '@/utils/authUtils';

export default function Setup2FAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email, companyName } = params;
  
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    initializeTOTP();
  }, []);

  const initializeTOTP = async () => {
    const newSecret = await generateTOTPSecret();
    setSecret(newSecret);
    const qrUrl = generateQRCodeData(newSecret, email as string);
    setQrCodeUrl(qrUrl);
    console.log('TOTP Secret:', newSecret);
    console.log('QR Code URL:', qrUrl);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);

    // Verify the TOTP code
    const isValid = verifyTOTP(secret, verificationCode);

    if (isValid) {
      // Store the secret securely
      const mockUserId = 'user_' + Date.now();
      await store2FASecret(mockUserId, secret);
      
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
      Alert.alert('Error', 'Invalid verification code. Please try again.');
      setVerificationCode('');
    }

    setIsVerifying(false);
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
              ios_icon_name="lock.shield"
              android_material_icon_name="security"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>Secure Your Account</Text>
          <Text style={styles.subtitle}>
            Set up two-factor authentication to add an extra layer of security
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Step 1: Install an Authenticator App</Text>
          <Text style={styles.description}>
            Download an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator on your mobile device.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Step 2: Scan QR Code</Text>
          <Text style={styles.description}>
            Open your authenticator app and scan this QR code:
          </Text>
          
          <View style={styles.qrCodeContainer}>
            <View style={styles.qrCodePlaceholder}>
              <IconSymbol
                ios_icon_name="qrcode"
                android_material_icon_name="qr-code"
                size={120}
                color={colors.textSecondary}
              />
              <Text style={styles.qrCodeNote}>
                In a production app, this would display an actual QR code
              </Text>
            </View>
          </View>

          <View style={styles.secretContainer}>
            <Text style={styles.secretLabel}>Or enter this code manually:</Text>
            <View style={styles.secretBox}>
              <Text style={styles.secretText}>{secret}</Text>
            </View>
            <Text style={styles.secretNote}>
              Save this code in a secure place. You&apos;ll need it to recover your account if you lose access to your authenticator app.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Step 3: Enter Verification Code</Text>
          <Text style={styles.description}>
            Enter the 6-digit code from your authenticator app:
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
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={isVerifying}
          >
            <Text style={styles.verifyButtonText}>
              {isVerifying ? 'Verifying...' : 'Verify & Enable 2FA'}
            </Text>
          </TouchableOpacity>
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
  qrCodeContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 16,
  },
  qrCodeNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  secretContainer: {
    marginTop: 20,
  },
  secretLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  secretBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secretText: {
    fontSize: 16,
    fontFamily: 'SpaceMono',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
  },
  secretNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
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
