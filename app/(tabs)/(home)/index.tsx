
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { PostCard } from '@/components/PostCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { mockPosts, currentUserId, mockUsers } from '@/data/mockData';
import { Post } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedSegment, setSelectedSegment] = useState(0);

  // Filter posts based on selected segment
  const filteredPosts = useMemo(() => {
    // Get the current user's following list
    const currentUser = mockUsers.find(user => user.id === currentUserId);
    const followingIds = currentUser?.following || [];

    if (selectedSegment === 0) {
      // All posts
      return posts;
    } else {
      // Only posts from businesses the user follows
      return posts.filter(post => followingIds.includes(post.userId));
    }
  }, [posts, selectedSegment]);

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likes.includes(currentUserId);
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter(id => id !== currentUserId)
              : [...post.likes, currentUserId],
          };
        }
        return post;
      })
    );
  };

  const handleComment = (postId: string) => {
    console.log('Open comments for post:', postId);
  };

  return (
    <View style={styles.container}>
      <SegmentedControl
        segments={['All Posts', 'Following']}
        selectedIndex={selectedSegment}
        onIndexChange={setSelectedSegment}
      />
      <FlatList
        data={filteredPosts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            currentUserId={currentUserId}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-post')}
        activeOpacity={0.8}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={28}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
