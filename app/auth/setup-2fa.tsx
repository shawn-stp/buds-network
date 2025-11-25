
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
import { generateEmailVerificationCode, sendVerificationEmail, verifyEmailCode, getStoredVerificationCode } from '@/utils/authUtils';

export default function Setup2FAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email, companyName } = params;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showDemoCode, setShowDemoCode] = useState(false);

  useEffect(() => {
    // Automatically send email when component mounts
    handleSendEmail();
  }, []);

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setShowDemoCode(false);
    
    try {
      // Generate a 6-digit code
      const code = generateEmailVerificationCode();
      setGeneratedCode(code);
      
      // Send email (demo mode - stores locally)
      const result = await sendVerificationEmail(email as string, code);
      
      if (result.success) {
        setEmailSent(true);
        setShowDemoCode(true);
        
        // Show alert with demo information
        Alert.alert(
          '📧 Demo Mode - Code Generated',
          `Since this is a demo app, no actual email was sent.\n\nYour verification code is displayed below for testing.\n\nFor production, enable Supabase or integrate an email service.`,
          [{ text: 'Got It' }]
        );
      } else {
        Alert.alert('Error', 'Failed to generate verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
    
    setIsSendingEmail(false);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);

    try {
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
    } catch (error) {
      console.error('Error verifying code:', error);
      Alert.alert('Error', 'An error occurred during verification. Please try again.');
    }

    setIsVerifying(false);
  };

  const handleResendCode = () => {
    Alert.alert(
      'Resend Code?',
      'Do you want to generate a new verification code?',
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

  const handleCopyCode = () => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Demo Mode', `Code: ${generatedCode}\n\nIn production, this would copy to clipboard.`);
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
            Two-factor authentication via email
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {!emailSent && isSendingEmail && (
          <View style={styles.card}>
            <View style={styles.loadingContainer}>
              <IconSymbol
                ios_icon_name="hourglass"
                android_material_icon_name="hourglass-empty"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.loadingText}>Generating verification code...</Text>
            </View>
          </View>
        )}

        {emailSent && showDemoCode && (
          <View style={styles.demoCard}>
            <View style={styles.demoHeader}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={24}
                color="#FF9500"
              />
              <Text style={styles.demoTitle}>Demo Mode</Text>
            </View>
            <Text style={styles.demoDescription}>
              No actual email was sent. This is a demo app.
            </Text>
            <View style={styles.codeDisplayContainer}>
              <Text style={styles.codeDisplayLabel}>Your Verification Code:</Text>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeDisplayText}>{generatedCode}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                <IconSymbol
                  ios_icon_name="doc.on.doc"
                  android_material_icon_name="content-copy"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.copyButtonText}>Tap to view code</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.productionNote}>
              <Text style={styles.productionNoteText}>
                💡 For production: Enable Supabase or integrate SendGrid/Mailgun
              </Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Enter Verification Code</Text>
          <Text style={styles.description}>
            Enter the 6-digit code displayed above:
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
            style={[styles.verifyButton, (isVerifying || !emailSent) && styles.verifyButtonDisabled]}
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
              {isSendingEmail ? 'Generating...' : 'Generate New Code'}
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
            The verification code expires in 10 minutes. You can generate a new code at any time.
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
  demoCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF9500',
    boxShadow: '0px 2px 8px rgba(255, 149, 0, 0.2)',
    elevation: 3,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  demoDescription: {
    fontSize: 14,
    color: '#8B6914',
    marginBottom: 16,
    lineHeight: 20,
  },
  codeDisplayContainer: {
    alignItems: 'center',
    gap: 12,
  },
  codeDisplayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B6914',
  },
  codeDisplay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#FF9500',
    borderStyle: 'dashed',
  },
  codeDisplayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9500',
    letterSpacing: 8,
    fontFamily: 'SpaceMono',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  copyButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  productionNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  productionNoteText: {
    fontSize: 12,
    color: '#8B6914',
    textAlign: 'center',
    lineHeight: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
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
