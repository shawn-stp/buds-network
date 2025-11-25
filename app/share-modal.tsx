
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';

export default function ShareModal() {
  const { postId, userName, content } = useLocalSearchParams<{
    postId: string;
    userName: string;
    content: string;
  }>();

  const shareUrl = `https://buds.app/post/${postId}`;
  const shareMessage = `Check out this post from ${userName} on Buds:\n\n${content}\n\n${shareUrl}`;

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: shareMessage,
        url: shareUrl,
      });

      if (result.action === Share.sharedAction) {
        console.log('Post shared successfully');
        router.back();
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('Error', 'Failed to share post. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(shareUrl);
      Alert.alert('Success', 'Link copied to clipboard!');
      router.back();
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Share Post</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <IconSymbol
              ios_icon_name="xmark"
              android_material_icon_name="close"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.options}>
          <TouchableOpacity style={styles.option} onPress={handleShare}>
            <View style={styles.optionIcon}>
              <IconSymbol
                ios_icon_name="square.and.arrow.up"
                android_material_icon_name="share"
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={styles.optionText}>Share via...</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleCopyLink}>
            <View style={styles.optionIcon}>
              <IconSymbol
                ios_icon_name="link"
                android_material_icon_name="link"
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={styles.optionText}>Copy Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  options: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
});
