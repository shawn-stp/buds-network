
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { mockUsers, mockPosts, currentUserId } from '@/data/mockData';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 48) / 3;

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const currentUser = mockUsers.find(u => u.id === currentUserId);
  const userPosts = mockPosts.filter(p => p.userId === currentUserId);

  if (!currentUser) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerLargeTitle: true,
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image source={{ uri: currentUser.profilePicture }} style={styles.profileImage} />
            <Text style={styles.companyName}>{currentUser.companyName}</Text>
            <Text style={styles.bio}>{currentUser.bio}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.buds.length}</Text>
                <Text style={styles.statLabel}>Buds</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.followers.length}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.primaryButton}>
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={18}
                  color={colors.card}
                />
                <Text style={styles.primaryButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <IconSymbol
                  ios_icon_name="link"
                  android_material_icon_name="link"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.secondaryButtonText}>Products</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <IconSymbol
                ios_icon_name="square.grid.3x3"
                android_material_icon_name="grid-on"
                size={24}
                color={activeTab === 'posts' ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
              onPress={() => setActiveTab('about')}
            >
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
                size={24}
                color={activeTab === 'about' ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {activeTab === 'posts' ? (
            <View style={styles.postsGrid}>
              {userPosts.map((post, index) => (
                <React.Fragment key={index}>
                  {post.images.length > 0 && (
                    <TouchableOpacity key={index} style={styles.gridItem}>
                      <Image source={{ uri: post.images[0] }} style={styles.gridImage} />
                    </TouchableOpacity>
                  )}
                </React.Fragment>
              ))}
            </View>
          ) : (
            <View style={styles.aboutSection}>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="link"
                    android_material_icon_name="link"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.infoText}>{currentUser.productsPageLink}</Text>
                </View>
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="person.2"
                    android_material_icon_name="people"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.infoText}>{currentUser.following.length} Following</Text>
                </View>
                <View style={styles.infoRow}>
                  <IconSymbol
                    ios_icon_name="calendar"
                    android_material_icon_name="calendar-today"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.infoText}>Joined January 2024</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 4,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  aboutSection: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});
