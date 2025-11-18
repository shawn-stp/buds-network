
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { mockUsers, currentUserId } from '@/data/mockData';
import { IconSymbol } from '@/components/IconSymbol';

type TabType = 'buds' | 'followers' | 'following';

export default function BudsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('buds');
  const currentUser = mockUsers.find(u => u.id === currentUserId);

  if (!currentUser) return null;

  const getBudsUsers = () => mockUsers.filter(u => currentUser.buds.includes(u.id));
  const getFollowersUsers = () => mockUsers.filter(u => currentUser.followers.includes(u.id));
  const getFollowingUsers = () => mockUsers.filter(u => currentUser.following.includes(u.id));

  const getDisplayUsers = () => {
    switch (activeTab) {
      case 'buds':
        return getBudsUsers();
      case 'followers':
        return getFollowersUsers();
      case 'following':
        return getFollowingUsers();
      default:
        return [];
    }
  };

  const handleUserPress = (userId: string) => {
    console.log('Navigate to user profile:', userId);
  };

  const handleFollowToggle = (userId: string) => {
    console.log('Toggle follow for user:', userId);
  };

  const renderUserItem = ({ item }: { item: typeof mockUsers[0] }) => {
    const isBud = currentUser.buds.includes(item.id);
    const isFollowing = currentUser.following.includes(item.id);

    return (
      <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item.id)}>
        <Image source={{ uri: item.profilePicture }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.companyName}</Text>
          <Text style={styles.userBio} numberOfLines={2}>{item.bio}</Text>
          {isBud && (
            <View style={styles.budBadge}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={14}
                color={colors.success}
              />
              <Text style={styles.budBadgeText}>Buds</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followingButton,
          ]}
          onPress={() => handleFollowToggle(item.id)}
        >
          <Text
            style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText,
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connections</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buds' && styles.activeTab]}
          onPress={() => setActiveTab('buds')}
        >
          <Text style={[styles.tabText, activeTab === 'buds' && styles.activeTabText]}>
            Buds ({currentUser.buds.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
            Followers ({currentUser.followers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            Following ({currentUser.following.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getDisplayUsers()}
        renderItem={renderUserItem}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 16,
    backgroundColor: colors.card,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  budBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  budBadgeText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.primary,
  },
});
