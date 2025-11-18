
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="buds" name="buds">
        <Icon sf="person.2.fill" />
        <Label>Buds</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="discovery" name="discovery">
        <Icon sf="safari.fill" />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="messages" name="messages">
        <Icon sf="message.fill" />
        <Label>Messages</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
