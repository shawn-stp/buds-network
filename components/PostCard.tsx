
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { Post, ImageOverlays } from '@/types';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  currentUserId?: string;
}

export function PostCard({ post, onLike, onComment, onShare, currentUserId = '1' }: PostCardProps) {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const isLiked = post.likes.includes(currentUserId);

  const handleLike = () => {
    console.log('Like pressed for post:', post.id);
    onLike?.(post.id);
  };

  const handleComment = () => {
    console.log('Comment pressed for post:', post.id);
    if (onComment) {
      onComment(post.id);
    } else {
      // Navigate to comments modal
      router.push({
        pathname: '/comments-modal',
        params: { postId: post.id },
      });
    }
  };

  const handleShare = () => {
    console.log('Share pressed for post:', post.id);
    if (onShare) {
      onShare(post.id);
    } else {
      // Navigate to share modal
      router.push({
        pathname: '/share-modal',
        params: {
          postId: post.id,
          userName: post.userName,
          content: post.content.substring(0, 100),
        },
      });
    }
  };

  const handleLinkPress = (url: string) => {
    console.log('Link pressed:', url);
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
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

  const renderImageWithOverlays = (imageUri: string, overlays?: ImageOverlays) => {
    return (
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUri }}
          style={styles.postImage}
          resizeMode="cover"
        />
        {overlays && (
          <View style={styles.overlaysContainer}>
            {overlays.texts.map((textOverlay) => (
              <View
                key={textOverlay.id}
                style={[
                  styles.textOverlay,
                  {
                    left: textOverlay.x,
                    top: textOverlay.y,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: textOverlay.fontSize,
                    color: textOverlay.color,
                    fontWeight: textOverlay.fontWeight,
                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  {textOverlay.text}
                </Text>
              </View>
            ))}
            
            {overlays.stickers.map((stickerOverlay) => (
              <View
                key={stickerOverlay.id}
                style={[
                  styles.stickerOverlay,
                  {
                    left: stickerOverlay.x,
                    top: stickerOverlay.y,
                  },
                ]}
              >
                <Text style={{ fontSize: stickerOverlay.size }}>
                  {stickerOverlay.emoji}
                </Text>
              </View>
            ))}
            
            {overlays.links.map((linkOverlay) => (
              <TouchableOpacity
                key={linkOverlay.id}
                style={[
                  styles.linkOverlay,
                  {
                    left: linkOverlay.x,
                    top: linkOverlay.y,
                  },
                ]}
                onPress={() => handleLinkPress(linkOverlay.url)}
              >
                <IconSymbol
                  ios_icon_name="link"
                  android_material_icon_name="link"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.linkText}>{linkOverlay.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
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
          {renderImageWithOverlays(
            post.images[imageIndex],
            post.imageOverlays?.[imageIndex]
          )}
          {post.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {post.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setImageIndex(index)}
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

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
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
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  overlaysContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  textOverlay: {
    position: 'absolute',
    padding: 8,
    pointerEvents: 'none',
  },
  stickerOverlay: {
    position: 'absolute',
    padding: 4,
    pointerEvents: 'none',
  },
  linkOverlay: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + 'CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
