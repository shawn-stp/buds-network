
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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { generateCaptcha, verifyCaptcha } from '@/utils/authUtils';

export default function SignUpScreen() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirthText, setDateOfBirthText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  };

  const parseDateOfBirth = (dateString: string): Date | null => {
    // Remove any non-numeric characters except /
    const cleaned = dateString.replace(/[^\d/]/g, '');
    
    // Try to parse MM/DD/YYYY format
    const parts = cleaned.split('/');
    if (parts.length !== 3) {
      return null;
    }

    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Validate ranges
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
      return null;
    }

    if (month < 1 || month > 12) {
      return null;
    }

    if (day < 1 || day > 31) {
      return null;
    }

    // Year should be 4 digits and reasonable
    if (year < 1900 || year > new Date().getFullYear()) {
      return null;
    }

    // Create date object (month is 0-indexed in JavaScript)
    const date = new Date(year, month - 1, day);

    // Verify the date is valid (handles cases like 02/31/2020)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDateInput = (text: string) => {
    // Remove any non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as MM/DD/YYYY
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    return formatted;
  };

  const handleDateChange = (text: string) => {
    const formatted = formatDateInput(text);
    setDateOfBirthText(formatted);
  };

  const getAgeDisplay = (): string | null => {
    const date = parseDateOfBirth(dateOfBirthText);
    if (date) {
      const age = calculateAge(date);
      return `Age: ${age} years old`;
    }
    return null;
  };

  const handleSignUp = () => {
    // Validation
    if (!companyName.trim()) {
      Alert.alert('Error', 'Please enter your company name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!dateOfBirthText.trim()) {
      Alert.alert('Error', 'Please enter your date of birth');
      return;
    }

    const dateOfBirth = parseDateOfBirth(dateOfBirthText);
    if (!dateOfBirth) {
      Alert.alert(
        'Invalid Date',
        'Please enter a valid date in MM/DD/YYYY format (e.g., 01/15/1990)'
      );
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 21) {
      Alert.alert(
        'Age Requirement',
        'You must be 21 years or older to create an account on Buds.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!verifyCaptcha(captchaInput, captcha.challenge)) {
      Alert.alert('Error', 'CAPTCHA verification failed. Please try again.');
      refreshCaptcha();
      return;
    }

    // Mock user creation
    console.log('Creating account:', { companyName, email, age });
    
    // Navigate to 2FA setup
    router.push({
      pathname: '/auth/setup-2fa',
      params: { email, companyName },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Account',
          headerShown: true,
          headerBackTitle: 'Back',
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
          <View style={styles.header}>
            <Text style={styles.title}>Join Buds</Text>
            <Text style={styles.subtitle}>
              Create your business account to connect with other companies
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
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
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <IconSymbol
                  ios_icon_name="envelope"
                  android_material_icon_name="email"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="company@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth (Must be 21+)</Text>
              <View style={styles.inputContainer}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={dateOfBirthText}
                  onChangeText={handleDateChange}
                  placeholder="MM/DD/YYYY (e.g., 01/15/1990)"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={10}
                  autoCorrect={false}
                />
              </View>
              {getAgeDisplay() && (
                <Text style={styles.ageText}>
                  {getAgeDisplay()}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <IconSymbol
                  ios_icon_name="lock"
                  android_material_icon_name="lock"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <IconSymbol
                    ios_icon_name={showPassword ? 'eye.slash' : 'eye'}
                    android_material_icon_name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <IconSymbol
                  ios_icon_name="lock"
                  android_material_icon_name="lock"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <IconSymbol
                    ios_icon_name={showConfirmPassword ? 'eye.slash' : 'eye'}
                    android_material_icon_name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.captchaSection}>
              <Text style={styles.label}>Security Verification</Text>
              <View style={styles.captchaContainer}>
                <View style={styles.captchaDisplay}>
                  <Text style={styles.captchaText}>{captcha.text}</Text>
                </View>
                <TouchableOpacity style={styles.refreshButton} onPress={refreshCaptcha}>
                  <IconSymbol
                    ios_icon_name="arrow.clockwise"
                    android_material_icon_name="refresh"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <IconSymbol
                  ios_icon_name="checkmark.shield"
                  android_material_icon_name="verified-user"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={captchaInput}
                  onChangeText={setCaptchaInput}
                  placeholder="Enter the characters above"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
              <Text style={styles.signUpButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  ageText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  captchaSection: {
    gap: 12,
  },
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  captchaDisplay: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  captchaText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 8,
    fontFamily: 'SpaceMono',
  },
  refreshButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  signUpButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
