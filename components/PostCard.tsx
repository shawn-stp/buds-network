
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Post } from '@/types';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  currentUserId?: string;
}

export function PostCard({ post, onLike, onComment, currentUserId = '1' }: PostCardProps) {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const isLiked = post.likes.includes(currentUserId);

  const handleLike = () => {
    console.log('Like pressed for post:', post.id);
    onLike?.(post.id);
  };

  const handleComment = () => {
    console.log('Comment pressed for post:', post.id);
    onComment?.(post.id);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo}>
          <Image source={{ uri: post.userProfilePicture }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.images.length > 0 && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: post.images[imageIndex] }}
            style={styles.postImage}
            resizeMode="cover"
          />
          {post.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {post.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === imageIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <IconSymbol
            ios_icon_name={isLiked ? 'heart.fill' : 'heart'}
            android_material_icon_name={isLiked ? 'favorite' : 'favorite-border'}
            size={24}
            color={isLiked ? colors.secondary : colors.textSecondary}
          />
          <Text style={styles.actionText}>{post.likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <IconSymbol
            ios_icon_name="bubble.left"
            android_material_icon_name="chat-bubble-outline"
            size={24}
            color={colors.textSecondary}
          />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <IconSymbol
            ios_icon_name="paperplane"
            android_material_icon_name="send"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: screenWidth - 32,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: colors.card,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
