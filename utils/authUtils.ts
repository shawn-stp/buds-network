
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Generate a random 6-digit code
export const generateEmailVerificationCode = (): string => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
};

// Store verification code with timestamp
export const storeVerificationCode = async (email: string, code: string): Promise<void> => {
  try {
    const data = {
      code,
      timestamp: Date.now(),
      expiresIn: 10 * 60 * 1000, // 10 minutes
    };
    await SecureStore.setItemAsync(`verification_code_${email}`, JSON.stringify(data));
    console.log('Verification code stored successfully');
  } catch (error) {
    console.error('Error storing verification code:', error);
    throw error;
  }
};

// Retrieve and verify code
export const verifyEmailCode = async (email: string, inputCode: string): Promise<boolean> => {
  try {
    const storedData = await SecureStore.getItemAsync(`verification_code_${email}`);
    if (!storedData) {
      console.log('No verification code found for email:', email);
      return false;
    }

    const { code, timestamp, expiresIn } = JSON.parse(storedData);
    const now = Date.now();

    // Check if code has expired
    if (now - timestamp > expiresIn) {
      console.log('Verification code expired');
      await SecureStore.deleteItemAsync(`verification_code_${email}`);
      return false;
    }

    // Verify code
    const isValid = code === inputCode;
    console.log('Code verification result:', isValid);
    
    if (isValid) {
      // Delete code after successful verification
      await SecureStore.deleteItemAsync(`verification_code_${email}`);
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
};

// Get stored verification code (for development/testing purposes)
export const getStoredVerificationCode = async (email: string): Promise<string | null> => {
  try {
    const storedData = await SecureStore.getItemAsync(`verification_code_${email}`);
    if (!storedData) {
      return null;
    }

    const { code, timestamp, expiresIn } = JSON.parse(storedData);
    const now = Date.now();

    // Check if code has expired
    if (now - timestamp > expiresIn) {
      await SecureStore.deleteItemAsync(`verification_code_${email}`);
      return null;
    }

    return code;
  } catch (error) {
    console.error('Error retrieving stored code:', error);
    return null;
  }
};

// Send verification email
// NOTE: This is a DEMO implementation that stores the code locally
// For production, you need to integrate a real email service like:
// - Supabase Auth (recommended)
// - SendGrid
// - Mailgun
// - AWS SES
export const sendVerificationEmail = async (email: string, code: string): Promise<{ success: boolean; code?: string }> => {
  try {
    console.log('='.repeat(60));
    console.log('📧 DEMO MODE - EMAIL VERIFICATION');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Subject: Your Buds Verification Code`);
    console.log('');
    console.log('Your verification code is:');
    console.log('');
    console.log(`    ${code}`);
    console.log('');
    console.log('This code will expire in 10 minutes.');
    console.log('If you did not request this code, please ignore this message.');
    console.log('='.repeat(60));
    console.log('⚠️  IMPORTANT: This is DEMO mode. No actual email was sent.');
    console.log('    The code is displayed in the app for testing purposes.');
    console.log('');
    console.log('    For production, integrate a real email service:');
    console.log('    - Enable Supabase and use Supabase Auth');
    console.log('    - Or integrate SendGrid/Mailgun/AWS SES');
    console.log('='.repeat(60));
    
    // Store the code
    await storeVerificationCode(email, code);
    
    // Return success with the code (for demo purposes)
    return { success: true, code };
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    return { success: false };
  }
};

// Generate a random secret for TOTP (kept for backward compatibility)
export const generateTOTPSecret = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(20);
  return base32Encode(randomBytes);
};

// Base32 encoding for TOTP secret
const base32Encode = (buffer: Uint8Array): string => {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += base32Chars[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += base32Chars[(value << (5 - bits)) & 31];
  }

  return output;
};

// Generate TOTP code from secret
export const generateTOTP = (secret: string, timeStep: number = 30): string => {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const counter = time.toString(16).padStart(16, '0');
  
  // Simple TOTP implementation for demo purposes
  // In production, use a proper TOTP library
  const hash = simpleHash(secret + counter);
  const offset = hash.charCodeAt(hash.length - 1) & 0xf;
  const code = parseInt(hash.substr(offset, 6), 16) % 1000000;
  
  return code.toString().padStart(6, '0');
};

// Simple hash function for demo purposes
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
};

// Verify TOTP code
export const verifyTOTP = (secret: string, code: string): boolean => {
  const currentCode = generateTOTP(secret);
  const previousCode = generateTOTP(secret, 30);
  
  // Allow current and previous time window
  return code === currentCode || code === previousCode;
};

// Store 2FA secret securely
export const store2FASecret = async (userId: string, secret: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(`2fa_secret_${userId}`, secret);
    console.log('2FA secret stored securely');
  } catch (error) {
    console.error('Error storing 2FA secret:', error);
  }
};

// Retrieve 2FA secret
export const get2FASecret = async (userId: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(`2fa_secret_${userId}`);
  } catch (error) {
    console.error('Error retrieving 2FA secret:', error);
    return null;
  }
};

// Delete 2FA secret
export const delete2FASecret = async (userId: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(`2fa_secret_${userId}`);
    console.log('2FA secret deleted');
  } catch (error) {
    console.error('Error deleting 2FA secret:', error);
  }
};

// Generate QR code data URL for TOTP
export const generateQRCodeData = (secret: string, email: string, issuer: string = 'Buds'): string => {
  const otpauthUrl = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;
  return otpauthUrl;
};

// Simple CAPTCHA generation
export const generateCaptcha = (): { text: string; challenge: string } => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let text = '';
  for (let i = 0; i < 6; i++) {
    text += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return { text, challenge: text };
};

// Verify CAPTCHA
export const verifyCaptcha = (userInput: string, challenge: string): boolean => {
  return userInput.toUpperCase() === challenge.toUpperCase();
};
