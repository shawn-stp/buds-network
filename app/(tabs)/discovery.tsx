
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';

interface UserProfile {
  id: string;
  user_id: string;
  company_name: string;
  bio: string;
  profile_picture: string | null;
  followers_count: number;
  posts_count: number;
  is_following: boolean;
}

export default function DiscoveryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in');
        return;
      }
      
      setCurrentUserId(user.id);

      // Get all profiles except current user
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        console.log('No other users found');
        setUsers([]);
        return;
      }

      // Get following status for each user
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = new Set(followingData?.map(f => f.following_id) || []);

      // Get followers count and posts count for each user
      const usersWithStats = await Promise.all(
        profilesData.map(async (profile) => {
          // Get followers count
          const { count: followersCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profile.user_id);

          // Get posts count
          const { count: postsCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            followers_count: followersCount || 0,
            posts_count: postsCount || 0,
            is_following: followingIds.has(profile.user_id),
          };
        })
      );

      setUsers(usersWithStats);
      console.log(`Loaded ${usersWithStats.length} users`);
    } catch (error) {
      console.error('Error in loadUsers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return;

    try {
      const user = users.find(u => u.user_id === userId);
      if (!user) return;

      if (user.is_following) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) {
          console.error('Error unfollowing:', error);
          return;
        }

        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.user_id === userId
              ? { ...u, is_following: false, followers_count: u.followers_count - 1 }
              : u
          )
        );
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: userId,
          });

        if (error) {
          console.error('Error following:', error);
          return;
        }

        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.user_id === userId
              ? { ...u, is_following: true, followers_count: u.followers_count + 1 }
              : u
          )
        );
      }
    } catch (error) {
      console.error('Error in handleFollow:', error);
    }
  };

  const handleUserPress = (userId: string) => {
    router.push({
      pathname: '/user-profile',
      params: { userId },
    });
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      user.company_name?.toLowerCase().includes(query) ||
      user.bio?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find new businesses to connect with</Text>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol
          ios_icon_name="magnifyingglass"
          android_material_icon_name="search"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol
              ios_icon_name="xmark.circle.fill"
              android_material_icon_name="cancel"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="person.2.slash"
              android_material_icon_name="people-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No businesses found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try a different search term' : 'No other users yet'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user, index) => (
            <View key={index} style={styles.userCard}>
              <TouchableOpacity
                style={styles.userInfoContainer}
                onPress={() => handleUserPress(user.user_id)}
              >
                {user.profile_picture ? (
                  <Image source={{ uri: user.profile_picture }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <IconSymbol
                      ios_icon_name="person.fill"
                      android_material_icon_name="person"
                      size={24}
                      color={colors.textSecondary}
                    />
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.companyName}>{user.company_name || 'Unknown'}</Text>
                  <Text style={styles.bio} numberOfLines={2}>{user.bio || 'No bio'}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <IconSymbol
                        ios_icon_name="person.2"
                        android_material_icon_name="people"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.statText}>{user.followers_count} followers</Text>
                    </View>
                    <View style={styles.statItem}>
                      <IconSymbol
                        ios_icon_name="square.grid.2x2"
                        android_material_icon_name="grid-on"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.statText}>{user.posts_count} posts</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  user.is_following && styles.followingButton
                ]}
                onPress={() => handleFollow(user.user_id)}
              >
                <Text style={[
                  styles.followButtonText,
                  user.is_following && styles.followingButtonText
                ]}>
                  {user.is_following ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
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
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 8,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  followingButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
