
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, FlatList } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { PostCard } from '@/components/PostCard';
import { mockPosts, currentUserId } from '@/data/mockData';
import { Post } from '@/types';

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

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
    <>
      <Stack.Screen
        options={{
          title: 'Buds Feed',
          headerLargeTitle: true,
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={posts}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
