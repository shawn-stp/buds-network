
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { PostCard } from '@/components/PostCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { mockPosts, currentUserId, mockUsers } from '@/data/mockData';
import { Post } from '@/types';

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedSegment, setSelectedSegment] = useState(0);

  // Get the current user's following list
  const currentUser = mockUsers.find(user => user.id === currentUserId);
  const followingIds = currentUser?.following || [];

  // Filter posts based on selected segment
  const filteredPosts = useMemo(() => {
    if (selectedSegment === 0) {
      // All posts
      return posts;
    } else {
      // Only posts from businesses the user follows
      return posts.filter(post => followingIds.includes(post.userId));
    }
  }, [posts, selectedSegment, followingIds]);

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
});
