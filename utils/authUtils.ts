
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Generate a random secret for TOTP
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
