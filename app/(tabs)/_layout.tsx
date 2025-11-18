
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'buds',
      route: '/(tabs)/buds',
      icon: 'people',
      label: 'Buds',
    },
    {
      name: 'discovery',
      route: '/(tabs)/discovery',
      icon: 'compass',
      label: 'Discover',
    },
    {
      name: 'messages',
      route: '/(tabs)/messages',
      icon: 'chatbubbles',
      label: 'Messages',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="buds" name="buds" />
        <Stack.Screen key="discovery" name="discovery" />
        <Stack.Screen key="messages" name="messages" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} containerWidth={420} />
    </>
  );
}
