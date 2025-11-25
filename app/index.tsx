
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <IconSymbol
              ios_icon_name="leaf.fill"
              android_material_icon_name="eco"
              size={64}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>Welcome to Buds</Text>
          <Text style={styles.subtitle}>
            Connect with businesses, share your products, and grow your network
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <IconSymbol
              ios_icon_name="person.2.fill"
              android_material_icon_name="people"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.featureText}>Connect with businesses</Text>
          </View>
          <View style={styles.feature}>
            <IconSymbol
              ios_icon_name="square.grid.2x2.fill"
              android_material_icon_name="grid-view"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.featureText}>Showcase your products</Text>
          </View>
          <View style={styles.feature}>
            <IconSymbol
              ios_icon_name="message.fill"
              android_material_icon_name="message"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.featureText}>Direct messaging</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 80 : 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 122, 255, 0.3)',
    elevation: 3,
  },
  primaryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  features: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
});
