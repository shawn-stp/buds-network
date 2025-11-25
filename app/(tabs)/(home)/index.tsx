
import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Platform, TouchableOpacity, RefreshControl, Text } from 'react-native';
import { router, useFocusEffect, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { PostCard } from '@/components/PostCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Post } from '@/types';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const routerHook = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }
      return user?.id || null;
    } catch (error) {
      console.error('Error in fetchCurrentUser:', error);
      return null;
    }
  };

  // Fetch following list
  const fetchFollowing = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (error) {
        console.error('Error fetching following:', error);
        return [];
      }

      return data?.map(f => f.following_id) || [];
    } catch (error) {
      console.error('Error in fetchFollowing:', error);
      return [];
    }
  };

  // Fetch posts from Supabase
  const fetchPosts = async () => {
    try {
      console.log('Fetching posts from Supabase...');
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          images,
          music_uri,
          music_name,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return [];
      }

      if (!postsData || postsData.length === 0) {
        console.log('No posts found');
        return [];
      }

      console.log(`Fetched ${postsData.length} posts`);

      // Fetch profiles for all users
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, company_name, profile_picture')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      // Fetch likes for all posts
      const postIds = postsData.map(p => p.id);
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      if (likesError) {
        console.error('Error fetching likes:', likesError);
      }

      const likesMap = new Map<string, string[]>();
      likesData?.forEach(like => {
        const existing = likesMap.get(like.post_id) || [];
        likesMap.set(like.post_id, [...existing, like.user_id]);
      });

      // Fetch comments for all posts
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('id, post_id, user_id, content, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      }

      const commentsMap = new Map<string, any[]>();
      commentsData?.forEach(comment => {
        const existing = commentsMap.get(comment.post_id) || [];
        commentsMap.set(comment.post_id, [...existing, comment]);
      });

      // Transform to Post format
      const transformedPosts: Post[] = postsData.map(post => {
        const profile = profilesMap.get(post.user_id);
        const likes = likesMap.get(post.id) || [];
        const comments = commentsMap.get(post.id) || [];

        return {
          id: post.id,
          userId: post.user_id,
          userName: profile?.company_name || 'Unknown User',
          userProfilePicture: profile?.profile_picture || '',
          content: post.content || '',
          images: post.images || [],
          music: post.music_uri && post.music_name ? {
            uri: post.music_uri,
            name: post.music_name,
          } : undefined,
          timestamp: new Date(post.created_at),
          likes: likes,
          comments: comments.map(c => ({
            id: c.id,
            userId: c.user_id,
            userName: profilesMap.get(c.user_id)?.company_name || 'Unknown User',
            content: c.content,
            timestamp: new Date(c.created_at),
          })),
        };
      });

      console.log(`Transformed ${transformedPosts.length} posts`);
      return transformedPosts;
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      return [];
    }
  };

  // Load all data
  const loadData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const userId = await fetchCurrentUser();
      setCurrentUserId(userId);

      if (userId) {
        const following = await fetchFollowing(userId);
        setFollowingIds(following);
      }

      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, loading data...');
      loadData();
    }, [])
  );

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

  const handleLike = async (postId: string) => {
    if (!currentUserId) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likes.includes(currentUserId);

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);

        if (error) {
          console.error('Error unliking post:', error);
          return;
        }

        // Update local state
        setPosts(prevPosts =>
          prevPosts.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                likes: p.likes.filter(id => id !== currentUserId),
              };
            }
            return p;
          })
        );
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: currentUserId,
          });

        if (error) {
          console.error('Error liking post:', error);
          return;
        }

        // Update local state
        setPosts(prevPosts =>
          prevPosts.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                likes: [...p.likes, currentUserId],
              };
            }
            return p;
          })
        );
      }
    } catch (error) {
      console.error('Error in handleLike:', error);
    }
  };

  const handleComment = (postId: string) => {
    console.log('Open comments for post:', postId);
    routerHook.push({
      pathname: '/comments-modal',
      params: { postId },
    });
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
    const post = posts.find(p => p.id === postId);
    if (post) {
      routerHook.push({
        pathname: '/share-modal',
        params: {
          postId: post.id,
          userName: post.userName,
          content: post.content.substring(0, 100),
        },
      });
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SegmentedControl
        segments={['All Posts', 'Following']}
        selectedIndex={selectedSegment}
        onIndexChange={setSelectedSegment}
      />
      {filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedSegment === 0 
              ? 'No posts yet. Be the first to create one!' 
              : 'No posts from businesses you follow yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              currentUserId={currentUserId || ''}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
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
