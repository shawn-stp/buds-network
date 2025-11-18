
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { mockUsers, currentUserId } from '@/data/mockData';
import { User } from '@/types';

export default function DiscoveryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = mockUsers.find(u => u.id === currentUserId);
  
  const discoverableUsers = mockUsers.filter(user => {
    if (user.id === currentUserId) return false;
    if (currentUser?.following.includes(user.id)) return false;
    if (searchQuery.trim() !== '') {
      return user.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             user.bio.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  const handleFollow = (userId: string) => {
    setFollowingStatus(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    console.log('Follow user:', userId);
  };

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
        {discoverableUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="person.2.slash"
              android_material_icon_name="people-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No businesses found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try a different search term' : 'You&apos;re already following everyone!'}
            </Text>
          </View>
        ) : (
          discoverableUsers.map((user, index) => (
            <View key={index} style={styles.userCard}>
              <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
              <View style={styles.userInfo}>
                <Text style={styles.companyName}>{user.companyName}</Text>
                <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <IconSymbol
                      ios_icon_name="person.2"
                      android_material_icon_name="people"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.statText}>{user.followers.length} followers</Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol
                      ios_icon_name="square.grid.2x2"
                      android_material_icon_name="grid-on"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.statText}>{user.posts.length} posts</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  followingStatus[user.id] && styles.followingButton
                ]}
                onPress={() => handleFollow(user.id)}
              >
                <Text style={[
                  styles.followButtonText,
                  followingStatus[user.id] && styles.followingButtonText
                ]}>
                  {followingStatus[user.id] ? 'Following' : 'Follow'}
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
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
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
