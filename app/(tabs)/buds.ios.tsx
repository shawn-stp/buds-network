
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { mockUsers, currentUserId } from '@/data/mockData';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TabType = 'buds' | 'followers' | 'following';

const BEST_BUDS_STORAGE_KEY = '@best_buds';

export default function BudsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('buds');
  const [bestBudsIds, setBestBudsIds] = useState<string[]>([]);
  const currentUser = mockUsers.find(u => u.id === currentUserId);

  useEffect(() => {
    loadBestBuds();
  }, []);

  const loadBestBuds = async () => {
    try {
      const stored = await AsyncStorage.getItem(BEST_BUDS_STORAGE_KEY);
      if (stored) {
        setBestBudsIds(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading best buds:', error);
    }
  };

  const saveBestBuds = async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(BEST_BUDS_STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      console.log('Error saving best buds:', error);
    }
  };

  const toggleBestBud = (userId: string) => {
    const newBestBuds = bestBudsIds.includes(userId)
      ? bestBudsIds.filter(id => id !== userId)
      : [...bestBudsIds, userId];
    
    setBestBudsIds(newBestBuds);
    saveBestBuds(newBestBuds);
  };

  if (!currentUser) return null;

  const getBudsUsers = () => {
    const buds = mockUsers.filter(u => currentUser.buds.includes(u.id));
    const bestBuds = buds.filter(u => bestBudsIds.includes(u.id));
    const otherBuds = buds.filter(u => !bestBudsIds.includes(u.id));
    return [...bestBuds, ...otherBuds];
  };

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
    const isBestBud = bestBudsIds.includes(item.id);

    return (
      <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item.id)}>
        <Image source={{ uri: item.profilePicture }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{item.companyName}</Text>
            {isBestBud && (
              <View style={styles.bestBudStar}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={16}
                  color="#FFD700"
                />
              </View>
            )}
          </View>
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
        <View style={styles.actionButtons}>
          {isBud && activeTab === 'buds' && (
            <TouchableOpacity
              style={styles.pinButton}
              onPress={() => toggleBestBud(item.id)}
            >
              <IconSymbol
                ios_icon_name={isBestBud ? "pin.fill" : "pin"}
                android_material_icon_name={isBestBud ? "push-pin" : "push-pin"}
                size={20}
                color={isBestBud ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          )}
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
        </View>
      </TouchableOpacity>
    );
  };

  const bestBudsCount = activeTab === 'buds' ? bestBudsIds.filter(id => currentUser.buds.includes(id)).length : 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Connections',
          headerLargeTitle: true,
          headerRight: () => (
            activeTab === 'buds' && bestBudsCount > 0 ? (
              <View style={styles.headerBestBudsIndicator}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={16}
                  color="#FFD700"
                />
                <Text style={styles.headerBestBudsText}>{bestBudsCount}</Text>
              </View>
            ) : null
          ),
        }}
      />
      <View style={styles.container}>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBestBudsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBestBudsText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
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
    paddingBottom: 16,
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
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  bestBudStar: {
    marginLeft: 2,
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
